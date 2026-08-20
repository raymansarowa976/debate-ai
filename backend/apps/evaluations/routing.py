from django.urls import path

from apps.evaluations.consumers import GradingStatusConsumer

websocket_urlpatterns = [
    path("api/ws/matches/<uuid:match_id>/", GradingStatusConsumer.as_asgi()),
]
