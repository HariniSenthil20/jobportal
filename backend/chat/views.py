from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Conversation, ConversationParticipant, Message
from .serializers import ConversationSerializer, MessageSerializer
from jobs.models import Job
from applications.models import JobApplication
from notifications.models import Notification, NotificationPreference
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants__user=self.request.user).distinct()

    @action(detail=False, methods=['post'], url_path='start')
    def start_conversation(self, request):
        job_id = request.data.get('job_id')
        other_user_id = request.data.get('user_id')
        user = request.user

        if not job_id:
            return Response({"error": "job_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        # Determine participant users
        if user.role == 'candidate':
            recruiter = job.recruiter
            candidate = user
        elif user.role == 'recruiter':
            if not other_user_id:
                return Response({"error": "Candidate user_id is required when recruiter starts conversation."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                candidate = User.objects.get(id=other_user_id, role='candidate')
            except User.DoesNotExist:
                return Response({"error": "Candidate user not found."}, status=status.HTTP_404_NOT_FOUND)
            recruiter = user
        else:
            return Response({"error": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate application relationship exists between candidate and job
        if not JobApplication.objects.filter(job=job, candidate=candidate).exists():
            return Response({"error": "Chat is only allowed between candidates who applied for the job and the job recruiter."}, status=status.HTTP_403_FORBIDDEN)

        # Check existing conversation for this job between candidate & recruiter
        existing_convs = Conversation.objects.filter(
            job=job,
            participants__user=candidate
        ).filter(
            participants__user=recruiter
        ).first()

        if existing_convs:
            serializer = self.get_serializer(existing_convs, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Create new conversation
        conversation = Conversation.objects.create(job=job)
        ConversationParticipant.objects.create(conversation=conversation, user=candidate)
        ConversationParticipant.objects.create(conversation=conversation, user=recruiter)

        serializer = self.get_serializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def messages_action(self, request, pk=None):
        conversation = self.get_object()

        # Authorization check: user must be participant
        if not ConversationParticipant.objects.filter(conversation=conversation, user=request.user).exists():
            return Response({"error": "Not a participant in this conversation."}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            # Mark incoming messages as read
            conversation.messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)
            messages = conversation.messages.all()
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            content = request.data.get('content', '').strip()
            if not content:
                return Response({"error": "Message content cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

            msg = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=content
            )

            # Update conversation updated_at
            conversation.save()

            # Notify recipient participant
            recipient_participant = conversation.participants.exclude(user=request.user).first()
            if recipient_participant:
                recipient = recipient_participant.user
                pref, _ = NotificationPreference.objects.get_or_create(user=recipient)
                if pref.messages:
                    Notification.objects.create(
                        user=recipient,
                        title=f"New message from {request.user.first_name or request.user.username}",
                        message=content[:100],
                        notification_type="message",
                        related_object_type="conversation",
                        related_object_id=conversation.id
                    )

            serializer = MessageSerializer(msg)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
