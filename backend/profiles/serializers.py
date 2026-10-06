import os
from rest_framework import serializers
from .models import CandidateProfile, RecruiterProfile, Resume
from authentication.serializers import UserSerializer
from companies.serializers import CompanySerializer

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ('id', 'file', 'filename', 'uploaded_at', 'is_primary')
        read_only_fields = ('filename', 'uploaded_at')

    def validate_file(self, value):
        ext = os.path.splitext(value.name)[1].lower()
        valid_extensions = ['.pdf', '.doc', '.docx']
        if ext not in valid_extensions:
            raise serializers.ValidationError("Unsupported file format. Please upload PDF, DOC, or DOCX files.")
        
        # Max size 5MB
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must not exceed 5MB.")
            
        return value

    def create(self, validated_data):
        file = validated_data['file']
        validated_data['filename'] = file.name
        return super().create(validated_data)


class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    resumes = ResumeSerializer(many=True, read_only=True)
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = '__all__'
        read_only_fields = ('user', 'completion_percentage')

    def get_completion_percentage(self, obj):
        return obj.calculate_completion()


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = RecruiterProfile
        fields = '__all__'
        read_only_fields = ('user',)
