from django.db import models
from django.conf import settings

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50) # status_change, application_submitted, message, reminder
    related_object_type = models.CharField(max_length=50, blank=True) # job, application, conversation
    related_object_id = models.IntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"


class NotificationPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_preferences')
    application_updates = models.BooleanField(default=True)
    status_changes = models.BooleanField(default=True)
    deadline_reminders = models.BooleanField(default=True)
    messages = models.BooleanField(default=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"
