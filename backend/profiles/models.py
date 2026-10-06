from django.db import models
from django.conf import settings
from companies.models import Company

class CandidateProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='candidate_profile')
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    career_summary = models.TextField(blank=True)
    education = models.JSONField(default=list, blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    experience = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=list, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    completion_percentage = models.IntegerField(default=0)

    def calculate_completion(self):
        score = 0
        if self.user.first_name and self.user.last_name:
            score += 15
        if self.phone:
            score += 10
        if self.location:
            score += 10
        if self.profile_photo:
            score += 10
        if self.career_summary:
            score += 15
        if self.skills and len(self.skills) > 0:
            score += 10
        if self.experience and len(self.experience) > 0:
            score += 10
        if self.education and len(self.education) > 0:
            score += 10
        if self.resumes.exists():
            score += 10
        
        self.completion_percentage = min(score, 100)
        return self.completion_percentage

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Candidate Profile: {self.user.username}"


class RecruiterProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recruiter_profile')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='recruiters')
    designation = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"Recruiter Profile: {self.user.username}"


class Resume(models.Model):
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_primary = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if self.is_primary:
            # Set other resumes of candidate to False
            Resume.objects.filter(candidate=self.candidate).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)
        # Update candidate completion score
        self.candidate.calculate_completion()
        self.candidate.save()

    def __str__(self):
        return f"Resume {self.filename} for {self.candidate.user.username}"
