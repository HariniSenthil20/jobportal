from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from companies.models import Company
from jobs.models import Job
from profiles.models import CandidateProfile, Resume
from applications.models import JobApplication, ApplicationStatusHistory

User = get_user_model()

class JobApplicationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(username='rec1', password='pass', role='recruiter')
        self.company = Company.objects.create(name='Tech Corp')
        self.recruiter.recruiter_profile.company = self.company
        self.recruiter.recruiter_profile.save()

        self.candidate = User.objects.create_user(username='cand1', password='pass', role='candidate')
        self.candidate_profile = self.candidate.candidate_profile

        # Upload dummy resume
        from django.core.files.uploadedfile import SimpleUploadedFile
        pdf_file = SimpleUploadedFile("resume.pdf", b"pdf content", content_type="application/pdf")
        self.resume = Resume.objects.create(candidate=self.candidate_profile, file=pdf_file, filename="resume.pdf")

        # Create active job
        self.job = Job.objects.create(
            recruiter=self.recruiter,
            company=self.company,
            title='Python Engineer',
            description='Build APIs',
            location='Remote',
            deadline=timezone.now() + timedelta(days=7),
            status='PUBLISHED'
        )

    def test_candidate_apply_success(self):
        self.client.force_authenticate(user=self.candidate)
        response = self.client.post('/api/applications/apply/', {'job_id': self.job.id, 'cover_letter': 'Excited to join!'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(JobApplication.objects.filter(candidate=self.candidate, job=self.job).exists())

    def test_prevent_duplicate_application(self):
        self.client.force_authenticate(user=self.candidate)
        # Apply once
        self.client.post('/api/applications/apply/', {'job_id': self.job.id})
        # Apply twice
        response = self.client.post('/api/applications/apply/', {'job_id': self.job.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already applied", response.data['error'])

    def test_recruiter_status_update(self):
        # Candidate applies
        app = JobApplication.objects.create(job=self.job, candidate=self.candidate, resume=self.resume, status='APPLIED')
        
        self.client.force_authenticate(user=self.recruiter)
        response = self.client.patch(f'/api/applications/{app.id}/update_status/', {'status': 'SHORTLISTED', 'notes': 'Great profile!'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, 'SHORTLISTED')
        self.assertTrue(ApplicationStatusHistory.objects.filter(application=app, status='SHORTLISTED').exists())
