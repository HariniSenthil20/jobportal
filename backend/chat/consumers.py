import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data.get('message', '').strip()
        sender_id = data.get('sender_id')

        if not message_text or not sender_id:
            return

        # Save message to DB
        msg_data = await self.save_message(self.conversation_id, sender_id, message_text)

        # Broadcast to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': msg_data
            }
        )

    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def save_message(self, conversation_id, sender_id, content):
        conv = Conversation.objects.get(id=conversation_id)
        sender = User.objects.get(id=sender_id)
        msg = Message.objects.create(conversation=conv, sender=sender, content=content)
        conv.save()
        return {
            'id': msg.id,
            'conversation': conv.id,
            'sender': {
                'id': sender.id,
                'username': sender.username,
                'first_name': sender.first_name,
                'last_name': sender.last_name,
            },
            'content': msg.content,
            'is_read': msg.is_read,
            'created_at': msg.created_at.isoformat()
        }
