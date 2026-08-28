import pytest
from asgiref.sync import sync_to_async
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator

from apps.matches.tests.factories import MatchFactory, UserFactory
from config.routing import websocket_urlpatterns

pytestmark = pytest.mark.django_db(transaction=True)


@pytest.fixture(autouse=True)
def in_memory_channel_layer(settings):
    settings.CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
    }


def test_config_routing_registers_the_grading_status_consumer():
    paths = [str(pattern.pattern) for pattern in websocket_urlpatterns]
    assert any("ws/matches/" in path for path in paths)


async def test_the_full_route_reaches_the_grading_status_consumer_at_the_nginx_path():
    application = URLRouter(websocket_urlpatterns)
    user = await sync_to_async(UserFactory)()
    match = await sync_to_async(MatchFactory)(user=user)

    communicator = WebsocketCommunicator(application, f"/api/ws/matches/{match.id}/")
    communicator.scope["user"] = user
    connected, _ = await communicator.connect()

    assert connected
    await communicator.disconnect()
