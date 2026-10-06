from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from jobs.models import Job, SavedJob
from applications.models import JobApplication
from notifications.models import Notification, NotificationPreference

class Command(BaseCommand):
    help = 'Check saved jobs for upcoming deadlines and auto-expire past deadline jobs.'

    def handle(self, *args, **options):
        now = timezone.now()
        self.stdout.write(f"Running deadline reminders at {now}...")

        # 1. Auto-expire jobs past deadline
        expired_jobs = Job.objects.filter(status='PUBLISHED', deadline__lt=now)
        expired_count = expired_jobs.update(status='EXPIRED')
        self.stdout.write(f"Auto-expired {expired_count} jobs.")

        # 2. Check saved jobs for candidates who haven't applied
        saved_jobs = SavedJob.objects.select_related('job', 'candidate').filter(job__status='PUBLISHED')

        reminders_sent = 0
        for saved in saved_jobs:
            candidate = saved.candidate
            job = saved.job

            # Skip if candidate already applied
            if JobApplication.objects.filter(candidate=candidate, job=job).exists():
                continue

            # Check candidate notification preference
            pref, _ = NotificationPreference.objects.get_or_create(user=candidate)
            if not pref.deadline_reminders:
                continue

            time_left = job.deadline - now
            days_left = time_left.days

            # 2 days reminder (between 24h and 48h)
            if 1 <= days_left <= 2:
                notification_type = f"deadline_reminder_2d_job_{job.id}"
                if not Notification.objects.filter(user=candidate, notification_type=notification_type).exists():
                    Notification.objects.create(
                        user=candidate,
                        title="Application Deadline Reminder",
                        message=f"⚠️ {job.title} application closes in 2 days.",
                        notification_type=notification_type,
                        related_object_type="job",
                        related_object_id=job.id
                    )
                    reminders_sent += 1

            # 1 day / final reminder (less than 24 hours left)
            elif 0 <= days_left < 1 and time_left.total_seconds() > 0:
                notification_type = f"deadline_reminder_1d_job_{job.id}"
                if not Notification.objects.filter(user=candidate, notification_type=notification_type).exists():
                    Notification.objects.create(
                        user=candidate,
                        title="Final Application Deadline Reminder",
                        message=f"⚠️ Urgent: {job.title} application closes in less than 24 hours!",
                        notification_type=notification_type,
                        related_object_type="job",
                        related_object_id=job.id
                    )
                    reminders_sent += 1

        self.stdout.write(self.style.SUCCESS(f"Finished! Sent {reminders_sent} deadline reminders."))
