from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from apps.evaluations.events import grading_group_name
from apps.matches.models import Match


class GradingStatusConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.match_id = self.scope["url_route"]["kwargs"]["match_id"]
        user = self.scope.get("user")

        if user is None or not user.is_authenticated:
            await self.close(code=4401)
            return

        if not await self._match_belongs_to_user(user):
            await self.close(code=4404)
            return

        self.group_name = grading_group_name(self.match_id)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def grading_status(self, event):
        await self.send_json({"event": event["event"]})

    @database_sync_to_async
    def _match_belongs_to_user(self, user):
        return Match.objects.filter(id=self.match_id, user=user).exists()
