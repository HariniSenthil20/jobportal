from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Company
from .serializers import CompanySerializer
from authentication.permissions import IsRecruiter

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'my_company', 'save_my_company']:
            return [IsRecruiter()]
        return [permissions.AllowAny()]

    @action(detail=False, methods=['get'])
    def my_company(self, request):
        if hasattr(request.user, 'recruiter_profile') and request.user.recruiter_profile.company:
            serializer = self.get_serializer(request.user.recruiter_profile.company)
            return Response(serializer.data)
        return Response({}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post', 'put'])
    def save_my_company(self, request):
        recruiter_profile = getattr(request.user, 'recruiter_profile', None)
        if not recruiter_profile:
            return Response({'detail': 'User profile is not configured as a recruiter.'}, status=status.HTTP_403_FORBIDDEN)

        company = recruiter_profile.company
        data = request.data.copy()

        # Sanitize empty string fields for optional URLFields
        if not data.get('website'):
            data['website'] = ''
        if not data.get('linkedin_url'):
            data['linkedin_url'] = ''

        if company:
            # Update existing recruiter's company
            serializer = self.get_serializer(company, data=data, partial=True)
        else:
            # Check if company with exact same name already exists in database
            company_name = data.get('name', '').strip()
            existing_company = Company.objects.filter(name__iexact=company_name).first()
            if existing_company:
                company = existing_company
                serializer = self.get_serializer(company, data=data, partial=True)
            else:
                serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            saved_company = serializer.save()
            recruiter_profile.company = saved_company
            recruiter_profile.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        company = serializer.save()
        if hasattr(self.request.user, 'recruiter_profile'):
            profile = self.request.user.recruiter_profile
            profile.company = company
            profile.save()
