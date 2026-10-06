from rest_framework import viewsets, permissions, status, generics, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q, Count
from .models import Job, Skill, SavedJob
from .serializers import JobSerializer, SkillSerializer, SavedJobSerializer
from authentication.permissions import IsRecruiter, IsCandidate
from applications.models import JobApplication

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'recruiter_jobs', 'recruiter_dashboard', 'toggle_status']:
            return [IsRecruiter()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        queryset = Job.objects.all()

        # If user is recruiter looking at their own jobs
        if self.action == 'recruiter_jobs' or (self.request.query_params.get('my_jobs') == 'true' and user.is_authenticated and user.role == 'recruiter'):
            return Job.objects.filter(recruiter=user).order_by('-created_at')

        # Otherwise candidates / public see active published jobs whose deadline hasn't passed
        now = timezone.now()
        queryset = queryset.filter(status='PUBLISHED', deadline__gte=now)

        # Filters
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) | 
                Q(company__name__icontains=search) |
                Q(location__icontains=search)
            )

        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)

        skills = self.request.query_params.get('skills')
        if skills:
            skill_list = [s.strip() for s in skills.split(',')]
            for s in skill_list:
                queryset = queryset.filter(Q(required_skills__icontains=s) | Q(preferred_skills__icontains=s))

        min_sal = self.request.query_params.get('min_salary')
        if min_sal:
            queryset = queryset.filter(max_salary__gte=int(min_sal))

        max_sal = self.request.query_params.get('max_salary')
        if max_sal:
            queryset = queryset.filter(min_salary__lte=int(max_sal))

        emp_type = self.request.query_params.get('employment_type')
        if emp_type:
            queryset = queryset.filter(employment_type=emp_type)

        exp_level = self.request.query_params.get('experience_level')
        if exp_level:
            queryset = queryset.filter(experience_level=exp_level)

        work_mode = self.request.query_params.get('work_mode')
        if work_mode:
            queryset = queryset.filter(work_mode=work_mode)

        qualification = self.request.query_params.get('qualification')
        if qualification:
            queryset = queryset.filter(qualification__icontains=qualification)

        posted_date = self.request.query_params.get('posted_date')
        if posted_date:
            if posted_date == '24h':
                queryset = queryset.filter(created_at__gte=now - timedelta(days=1))
            elif posted_date == '7d':
                queryset = queryset.filter(created_at__gte=now - timedelta(days=7))
            elif posted_date == '30d':
                queryset = queryset.filter(created_at__gte=now - timedelta(days=30))

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        recruiter = self.request.user
        company = recruiter.recruiter_profile.company
        if not company:
            raise serializers.ValidationError({"company": "Recruiter must be linked to a company before creating jobs."})
        serializer.save(recruiter=recruiter, company=company)

    @action(detail=False, methods=['get'], url_path='my_jobs', permission_classes=[IsRecruiter])
    def recruiter_jobs(self, request):
        jobs = Job.objects.filter(recruiter=request.user).order_by('-created_at')
        page = self.paginate_queryset(jobs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch', 'post'], url_path='toggle_status', permission_classes=[IsRecruiter])
    def toggle_status(self, request, pk=None):
        job = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Job.STATUS_CHOICES):
            job.status = new_status
            job.save()
            return Response(self.get_serializer(job).data)
        return Response({'error': 'Invalid status value.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsRecruiter])
    def recruiter_dashboard(self, request):
        user = request.user
        my_jobs = Job.objects.filter(recruiter=user)
        active_jobs = my_jobs.filter(status='PUBLISHED', deadline__gte=timezone.now()).count()
        
        my_applications = JobApplication.objects.filter(job__recruiter=user)
        total_apps = my_applications.count()
        shortlisted = my_applications.filter(status='SHORTLISTED').count()
        interviews = my_applications.filter(status='INTERVIEW').count()
        selected = my_applications.filter(status='SELECTED').count()

        # Jobs nearing deadline (closing within 3 days)
        ending_soon = my_jobs.filter(status='PUBLISHED', deadline__gte=timezone.now(), deadline__lte=timezone.now() + timedelta(days=3))
        ending_soon_data = JobSerializer(ending_soon, many=True, context={'request': request}).data

        # Recent applications
        recent_apps = my_applications.order_by('-applied_at')[:5]
        recent_apps_data = [
            {
                'id': app.id,
                'candidate_name': f"{app.candidate.first_name} {app.candidate.last_name}".strip() or app.candidate.username,
                'job_title': app.job.title,
                'status': app.status,
                'applied_at': app.applied_at
            }
            for app in recent_apps
        ]

        return Response({
            'stats': {
                'active_jobs': active_jobs,
                'total_applications': total_apps,
                'shortlisted': shortlisted,
                'interviews': interviews,
                'selected': selected
            },
            'ending_soon_jobs': ending_soon_data,
            'recent_applications': recent_apps_data
        })

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def trigger_reminders(self, request):
        from django.core.management import call_command
        call_command('run_reminders')
        return Response({'message': 'Deadline reminders executed successfully.'})


class SavedJobViewSet(viewsets.ModelViewSet):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return SavedJob.objects.filter(candidate=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['delete'], url_path='remove-by-job/(?P<job_id>\d+)')
    def remove_by_job(self, request, job_id=None):
        deleted_count, _ = SavedJob.objects.filter(candidate=request.user, job_id=job_id).delete()
        if deleted_count > 0:
            return Response({"message": "Bookmark removed"}, status=status.HTTP_200_OK)
        return Response({"error": "Bookmark not found"}, status=status.HTTP_404_NOT_FOUND)
