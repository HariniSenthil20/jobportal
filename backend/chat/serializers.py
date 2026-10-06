from rest_framework import serializers
from .models import Conversation, ConversationParticipant, Message
from authentication.serializers import UserSerializer
from jobs.serializers import JobSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'conversation', 'sender', 'content', 'is_read', 'created_at')
        read_only_fields = ('conversation', 'sender', 'created_at')


class ConversationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'job', 'participants', 'last_message', 'unread_count', 'created_at', 'updated_at')

    def get_participants(self, obj):
        users = [p.user for p in obj.participants.all()]
        return UserSerializer(users, many=True).data

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return MessageSerializer(msg).data
        return None

    def get_unread_count(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.messages.exclude(sender=user).filter(is_read=False).count()
        return 0
