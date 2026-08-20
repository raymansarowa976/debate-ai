import pytest
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.urls import path

from apps.evaluations.consumers import GradingStatusConsumer
from apps.evaluations.events import GradingEvent, grading_group_name
from apps.matches.tests.factories import MatchFactory, UserFactory

pytestmark = pytest.mark.django_db(transaction=True)

application = URLRouter(
    [path("ws/matches/<uuid:match_id>/", GradingStatusConsumer.as_asgi())]
)


@pytest.fixture(autouse=True)
def in_memory_channel_layer(settings):
    settings.CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
    }


async def _connect(match, user):
    communicator = WebsocketCommunicator(application, f"/ws/matches/{match.id}/")
    communicator.scope["user"] = user
    connected, _ = await communicator.connect()
    return communicator, connected


async def test_accepts_the_connection_for_the_matchs_owner():
    user = await sync_to_async(UserFactory)()
    match = await sync_to_async(MatchFactory)(user=user)

    communicator, connected = await _connect(match, user)

    assert connected
    await communicator.disconnect()


async def test_rejects_the_connection_for_an_unauthenticated_user():
    match = await sync_to_async(MatchFactory)()

    communicator = WebsocketCommunicator(application, f"/ws/matches/{match.id}/")
    connected, _ = await communicator.connect()

    assert not connected
    await communicator.disconnect()


async def test_rejects_the_connection_for_a_non_owner():
    owner = await sync_to_async(UserFactory)()
    other_user = await sync_to_async(UserFactory)()
    match = await sync_to_async(MatchFactory)(user=owner)

    communicator, connected = await _connect(match, other_user)

    assert not connected
    await communicator.disconnect()


async def test_rejects_the_connection_for_a_nonexistent_match():
    user = await sync_to_async(UserFactory)()

    communicator = WebsocketCommunicator(
        application, "/ws/matches/00000000-0000-0000-0000-000000000000/"
    )
    communicator.scope["user"] = user
    connected, _ = await communicator.connect()

    assert not connected
    await communicator.disconnect()


async def test_forwards_a_grading_event_published_to_the_matchs_group():
    user = await sync_to_async(UserFactory)()
    match = await sync_to_async(MatchFactory)(user=user)
    communicator, connected = await _connect(match, user)
    assert connected

    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        grading_group_name(match.id),
        {"type": "grading.status", "event": GradingEvent.JUDGE_START},
    )

    message = await communicator.receive_json_from()
    assert message == {"event": GradingEvent.JUDGE_START}

    await communicator.disconnect()


async def test_two_matches_do_not_cross_talk():
    user = await sync_to_async(UserFactory)()
    match_a = await sync_to_async(MatchFactory)(user=user)
    match_b = await sync_to_async(MatchFactory)(user=user)
    communicator_a, connected_a = await _connect(match_a, user)
    communicator_b, connected_b = await _connect(match_b, user)
    assert connected_a and connected_b

    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        grading_group_name(match_a.id),
        {"type": "grading.status", "event": GradingEvent.JUDGE_START},
    )

    message = await communicator_a.receive_json_from()
    assert message == {"event": GradingEvent.JUDGE_START}
    assert await communicator_b.receive_nothing()

    await communicator_a.disconnect()
    await communicator_b.disconnect()
