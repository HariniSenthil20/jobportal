from rest_framework import serializers
from .models import JobApplication, ApplicationStatusHistory
from jobs.serializers import JobSerializer
from authentication.serializers import UserSerializer
from profiles.serializers import ResumeSerializer, CandidateProfileSerializer

class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationStatusHistory
        fields = ('id', 'status', 'notes', 'changed_by_name', 'created_at')

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return f"{obj.changed_by.first_name} {obj.changed_by.last_name}".strip() or obj.changed_by.username
        return "System"


class JobApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)
    candidate = UserSerializer(read_only=True)
    candidate_profile = serializers.SerializerMethodField()
    resume = ResumeSerializer(read_only=True)
    resume_id = serializers.IntegerField(write_only=True, required=False)
    history = ApplicationStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ('candidate', 'status', 'applied_at', 'updated_at')

    def get_candidate_profile(self, obj):
        if hasattr(obj.candidate, 'candidate_profile'):
            return CandidateProfileSerializer(obj.candidate.candidate_profile).data
        return None
