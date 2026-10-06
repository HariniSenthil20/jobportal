from django.db import models

class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    logo = models.CharField(max_length=500, blank=True, default='')
    description = models.TextField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    company_size = models.CharField(max_length=50, blank=True)
    founded_year = models.IntegerField(null=True, blank=True)
    linkedin_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.name
