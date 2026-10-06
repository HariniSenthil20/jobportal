from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Q
from .models import JobApplication, ApplicationStatusHistory
from .serializers import JobApplicationSerializer, ApplicationStatusHistorySerializer
from jobs.models import Job
from profiles.models import Resume, CandidateProfile
from notifications.models import Notification, NotificationPreference
from authentication.permissions import IsCandidate, IsRecruiter

class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer

    def get_permissions(self):
        if self.action in ['my_applications', 'apply', 'withdraw']:
            return [permissions.IsAuthenticated(), IsCandidate()]
        elif self.action in ['recruiter_applications', 'job_applications', 'update_status']:
            return [permissions.IsAuthenticated(), IsRecruiter()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'candidate':
            return JobApplication.objects.filter(candidate=user)
        elif user.role == 'recruiter':
            return JobApplication.objects.filter(job__recruiter=user)
        return JobApplication.objects.none()

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsCandidate])
    def apply(self, request):
        candidate = request.user
        job_id = request.data.get('job_id')
        cover_letter = request.data.get('cover_letter', '')
        resume_id = request.data.get('resume_id')

        if not job_id:
            return Response({"error": "Job ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Verify Job exists and is active & deadline not passed
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        if job.status != 'PUBLISHED':
            return Response({"error": "This job is no longer active for applications."}, status=status.HTTP_400_BAD_REQUEST)

        if job.deadline < timezone.now():
            return Response({"error": "The deadline for this job application has passed."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Verify Candidate has Resume
        profile, _ = CandidateProfile.objects.get_or_create(user=candidate)
        if resume_id:
            try:
                resume = Resume.objects.get(id=resume_id, candidate=profile)
            except Resume.DoesNotExist:
                return Response({"error": "Selected resume not found."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            resume = Resume.objects.filter(candidate=profile, is_primary=True).first()
            if not resume:
                resume = Resume.objects.filter(candidate=profile).first()

        if not resume:
            return Response({"error": "Please upload a resume before applying for jobs."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Verify Candidate has not already applied
        if JobApplication.objects.filter(job=job, candidate=candidate).exists():
            return Response({"error": "You have already applied for this job."}, status=status.HTTP_400_BAD_REQUEST)

        # Create Application
        application = JobApplication.objects.create(
            job=job,
            candidate=candidate,
            resume=resume,
            cover_letter=cover_letter,
            status='APPLIED'
        )

        # Create initial Status History
        ApplicationStatusHistory.objects.create(
            application=application,
            status='APPLIED',
            notes='Application submitted by candidate.',
            changed_by=candidate
        )

        # Notify Recruiter
        Notification.objects.create(
            user=job.recruiter,
            title="New Job Application Received",
            message=f"{candidate.first_name or candidate.username} applied for {job.title}",
            notification_type="new_application",
            related_object_type="application",
            related_object_id=application.id
        )

        # Notify Candidate confirmation
        Notification.objects.create(
            user=candidate,
            title="Application Submitted",
            message=f"Your application for {job.title} at {job.company.name} was successfully submitted.",
            notification_type="application_submitted",
            related_object_type="application",
            related_object_id=application.id
        )

        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsCandidate])
    def my_applications(self, request):
        apps = JobApplication.objects.filter(candidate=request.user).order_by('-applied_at')
        page = self.paginate_queryset(apps)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(apps, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsCandidate])
    def withdraw(self, request, pk=None):
        application = self.get_object()
        if application.candidate != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        if application.status == 'WITHDRAWN':
            return Response({"error": "Application is already withdrawn."}, status=status.HTTP_400_BAD_REQUEST)

        application.status = 'WITHDRAWN'
        application.save()

        ApplicationStatusHistory.objects.create(
            application=application,
            status='WITHDRAWN',
            notes='Application withdrawn by candidate.',
            changed_by=request.user
        )

        # Notify Recruiter
        Notification.objects.create(
            user=application.job.recruiter,
            title="Application Withdrawn",
            message=f"{request.user.first_name or request.user.username} withdrew their application for {application.job.title}",
            notification_type="application_withdrawal",
            related_object_type="application",
            related_object_id=application.id
        )

        return Response({"message": "Application withdrawn successfully."})

    @action(detail=False, methods=['get'], url_path='job_applications', permission_classes=[permissions.IsAuthenticated, IsRecruiter])
    def recruiter_applications(self, request):
        apps = JobApplication.objects.filter(job__recruiter=request.user)

        job_id = request.query_params.get('job_id')
        if job_id:
            apps = apps.filter(job_id=job_id)

        app_status = request.query_params.get('status')
        if app_status:
            apps = apps.filter(status=app_status)

        search = request.query_params.get('search')
        if search:
            apps = apps.filter(
                Q(candidate__first_name__icontains=search) |
                Q(candidate__last_name__icontains=search) |
                Q(candidate__email__icontains=search) |
                Q(job__title__icontains=search)
            )

        page = self.paginate_queryset(apps.order_by('-applied_at'))
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(apps, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated, IsRecruiter])
    def update_status(self, request, pk=None):
        application = self.get_object()
        if application.job.recruiter != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        notes = request.data.get('notes', '')

        valid_statuses = [choice[0] for choice in JobApplication.STATUS_CHOICES]
        if not new_status or new_status not in valid_statuses:
            return Response({"error": f"Invalid status. Choose from: {', '.join(valid_statuses)}"}, status=status.HTTP_400_BAD_REQUEST)

        old_status = application.status
        application.status = new_status
        application.save()

        # Log history
        ApplicationStatusHistory.objects.create(
            application=application,
            status=new_status,
            notes=notes or f"Status updated from {old_status} to {new_status}",
            changed_by=request.user
        )

        # Notify Candidate if allowed by preferences
        pref, _ = NotificationPreference.objects.get_or_create(user=application.candidate)
        if pref.status_changes:
            Notification.objects.create(
                user=application.candidate,
                title=f"Application Status Updated: {new_status.replace('_', ' ').title()}",
                message=f"Your application status for {application.job.title} at {application.job.company.name} has been updated to '{new_status.replace('_', ' ').title()}'.",
                notification_type="status_change",
                related_object_type="application",
                related_object_id=application.id
            )

        serializer = self.get_serializer(application)
        return Response(serializer.data)
