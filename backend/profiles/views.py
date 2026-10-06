from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.db import models
from .models import CandidateProfile, RecruiterProfile, Resume
from .serializers import CandidateProfileSerializer, RecruiterProfileSerializer, ResumeSerializer
from authentication.permissions import IsCandidate, IsRecruiter
from companies.models import Company

class CandidateProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        profile.calculate_completion()
        return profile

    def perform_update(self, serializer):
        profile = serializer.save()
        # Update user first_name and last_name if present in request
        first_name = self.request.data.get('first_name')
        last_name = self.request.data.get('last_name')
        if first_name is not None:
            self.request.user.first_name = first_name
        if last_name is not None:
            self.request.user.last_name = last_name
        if first_name is not None or last_name is not None:
            self.request.user.save()
        profile.calculate_completion()
        profile.save()


class CandidateDetailView(generics.RetrieveAPIView):
    queryset = CandidateProfile.objects.all()
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class CandidateListView(generics.ListAPIView):
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        queryset = CandidateProfile.objects.all().select_related('user')
        search = self.request.query_params.get('search', '').strip()
        location = self.request.query_params.get('location', '').strip()

        if search:
            queryset = queryset.filter(
                models.Q(user__first_name__icontains=search) |
                models.Q(user__last_name__icontains=search) |
                models.Q(user__email__icontains=search) |
                models.Q(career_summary__icontains=search) |
                models.Q(skills__icontains=search)
            )
        if location:
            queryset = queryset.filter(location__icontains=location)

        return queryset


class RecruiterProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = RecruiterProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_object(self):
        profile, _ = RecruiterProfile.objects.get_or_create(user=self.request.user)
        return profile

    def perform_update(self, serializer):
        company_id = serializer.validated_data.pop('company_id', None)
        profile = serializer.save()
        if company_id:
            try:
                company = Company.objects.get(id=company_id)
                profile.company = company
                profile.save()
            except Company.DoesNotExist:
                pass


class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return Resume.objects.filter(candidate=profile)

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(candidate=profile)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        candidate = instance.candidate
        self.perform_destroy(instance)
        candidate.calculate_completion()
        candidate.save()
        return Response(status=status.HTTP_24_NO_CONTENT)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def download(self, request, pk=None):
        resume = get_object_or_404(Resume, pk=pk)
        return FileResponse(resume.file.open('rb'), as_attachment=True, filename=resume.filename)
