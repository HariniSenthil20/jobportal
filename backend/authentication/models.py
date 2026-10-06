from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    ROLE_CHOICES = (
        ('candidate', 'Candidate'),
        ('recruiter', 'Recruiter'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='candidate')
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_candidate(self):
        return self.role == 'candidate'

    @property
    def is_recruiter(self):
        return self.role == 'recruiter'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


@receiver(post_save, sender=User)
def create_user_profile_and_preferences(sender, instance, created, **kwargs):
    if created:
        from profiles.models import CandidateProfile, RecruiterProfile
        from notifications.models import NotificationPreference
        
        if instance.role == 'candidate':
            CandidateProfile.objects.get_or_create(user=instance)
        elif instance.role == 'recruiter':
            RecruiterProfile.objects.get_or_create(user=instance)
            
        NotificationPreference.objects.get_or_create(user=instance)
