from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CandidateProfileView, RecruiterProfileView, CandidateDetailView, CandidateListView, ResumeViewSet

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume')

urlpatterns = [
    path('candidate/me/', CandidateProfileView.as_view(), name='candidate_profile_me'),
    path('candidate/<int:pk>/', CandidateDetailView.as_view(), name='candidate_profile_detail'),
    path('candidates/', CandidateListView.as_view(), name='candidate_list'),
    path('recruiter/me/', RecruiterProfileView.as_view(), name='recruiter_profile_me'),
    path('', include(router.urls)),
]
