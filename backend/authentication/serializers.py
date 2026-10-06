from rest_framework import serializers
from django.contrib.auth import get_user_model
from profiles.models import CandidateProfile, RecruiterProfile
from notifications.models import NotificationPreference

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'role')

    def create(self, validated_data):
        role = validated_data.get('role', 'candidate')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=role
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.SerializerMethodField()
    company_id = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'completion_percentage', 'company_id', 'company_name', 'created_at')

    def get_completion_percentage(self, obj):
        if obj.role == 'candidate' and hasattr(obj, 'candidate_profile'):
            return obj.candidate_profile.calculate_completion()
        return 100

    def get_company_id(self, obj):
        if obj.role == 'recruiter' and hasattr(obj, 'recruiter_profile') and obj.recruiter_profile.company:
            return obj.recruiter_profile.company.id
        return None

    def get_company_name(self, obj):
        if obj.role == 'recruiter' and hasattr(obj, 'recruiter_profile') and obj.recruiter_profile.company:
            return obj.recruiter_profile.company.name
        return None
