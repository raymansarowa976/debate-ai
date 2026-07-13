import pytest
from django.urls import reverse

from apps.matches.models import Match, MatchStatus, Message, Round, SenderType
from apps.matches.tests.factories import MatchFactory, RoundFactory

pytestmark = pytest.mark.django_db


def words(n):
    return " ".join(["word"] * n)


def message_url(match_id):
    return reverse("message-create", kwargs={"match_id": match_id})


def test_post_message_when_initialized_transitions_to_ai_turn_and_creates_round_and_message(
    auth_client, user
):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    response = auth_client.post(message_url(match.id), {"content": words(60)})

    assert response.status_code == 201
    match.refresh_from_db()
    assert match.status == MatchStatus.AI_TURN
    assert Round.objects.filter(match=match).count() == 1
    round_obj = Round.objects.get(match=match)
    assert round_obj.round_number == 1
    assert Message.objects.filter(match=match, round=round_obj, sender=SenderType.USER).count() == 1


def test_post_message_when_user_turn_opens_next_round_number(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.USER_TURN)
    RoundFactory(match=match, round_number=1)

    response = auth_client.post(message_url(match.id), {"content": words(60)})

    assert response.status_code == 201
    new_round = Round.objects.get(match=match, round_number=2)
    assert Message.objects.filter(round=new_round).exists()


@pytest.mark.parametrize("status", [MatchStatus.AI_TURN, MatchStatus.EVALUATING, MatchStatus.COMPLETED])
def test_post_message_returns_409_when_not_open_for_user_turn(auth_client, user, status):
    match = MatchFactory(user=user, status=status)

    response = auth_client.post(message_url(match.id), {"content": words(60)})

    assert response.status_code == 409
    match.refresh_from_db()
    assert match.status == status
    assert not Round.objects.filter(match=match).exists()
    assert not Message.objects.filter(match=match).exists()


def test_post_message_rejects_under_50_words(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    response = auth_client.post(message_url(match.id), {"content": words(49)})

    assert response.status_code == 400
    match.refresh_from_db()
    assert match.status == MatchStatus.INITIALIZED
    assert not Message.objects.filter(match=match).exists()


def test_post_message_accepts_exactly_50_words(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    response = auth_client.post(message_url(match.id), {"content": words(50)})

    assert response.status_code == 201


def test_post_message_rejects_over_500_words(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    response = auth_client.post(message_url(match.id), {"content": words(501)})

    assert response.status_code == 400


def test_post_message_accepts_exactly_500_words(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    response = auth_client.post(message_url(match.id), {"content": words(500)})

    assert response.status_code == 201


def test_post_message_requires_authentication(api_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    response = api_client.post(message_url(match.id), {"content": words(60)})

    assert response.status_code == 403


def test_post_message_returns_404_for_non_owner_match(auth_client, other_user):
    match = MatchFactory(user=other_user, status=MatchStatus.INITIALIZED)

    response = auth_client.post(message_url(match.id), {"content": words(60)})

    assert response.status_code == 404


def test_post_message_returns_404_for_nonexistent_match(auth_client):
    response = auth_client.post(
        message_url("00000000-0000-0000-0000-000000000000"), {"content": words(60)}
    )

    assert response.status_code == 404


def test_post_message_forces_sender_to_user_regardless_of_payload(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    response = auth_client.post(
        message_url(match.id), {"content": words(60), "sender": SenderType.AI}
    )

    assert response.status_code == 201
    message = Message.objects.get(match=match)
    assert message.sender == SenderType.USER
