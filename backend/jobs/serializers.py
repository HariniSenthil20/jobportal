from rest_framework import serializers
from django.utils import timezone
from .models import Job, Skill, SavedJob
from companies.serializers import CompanySerializer

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    is_saved = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('recruiter', 'company', 'created_at', 'updated_at')

    def get_is_saved(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated and user.role == 'candidate':
            return SavedJob.objects.filter(candidate=user, job=obj).exists()
        return False

    def get_has_applied(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated and user.role == 'candidate':
            return obj.applications.filter(candidate=user).exists()
        return False

    def get_applications_count(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated and user.role == 'recruiter' and obj.recruiter == user:
            return obj.applications.count()
        return 0

    def validate(self, attrs):
        min_sal = attrs.get('min_salary', getattr(self.instance, 'min_salary', None))
        max_sal = attrs.get('max_salary', getattr(self.instance, 'max_salary', None))
        deadline = attrs.get('deadline', getattr(self.instance, 'deadline', None))

        if min_sal is not None and max_sal is not None and min_sal > max_sal:
            raise serializers.ValidationError({"salary": "Minimum salary cannot be greater than maximum salary."})

        if deadline and deadline < timezone.now():
            raise serializers.ValidationError({"deadline": "Application deadline must be a future date."})

        return attrs


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SavedJob
        fields = ('id', 'job', 'job_id', 'saved_at')

    def create(self, validated_data):
        candidate = self.context['request'].user
        job_id = validated_data['job_id']
        job = Job.objects.get(id=job_id)
        saved_job, created = SavedJob.objects.get_or_create(candidate=candidate, job=job)
        return saved_job
