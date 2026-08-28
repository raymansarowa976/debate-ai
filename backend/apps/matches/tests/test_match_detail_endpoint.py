import pytest
from django.urls import reverse

from apps.matches.models import MatchStatus
from apps.matches.tests.factories import MatchFactory, MessageFactory, RoundFactory

pytestmark = pytest.mark.django_db


def detail_url(match_id):
    return reverse("match-detail", kwargs={"match_id": match_id})


def test_retrieve_match_returns_status_topic_and_nested_rounds_and_messages(
    auth_client, user
):
    match = MatchFactory(
        user=user, status=MatchStatus.AI_TURN, topic="Should AI write laws?"
    )
    round_obj = RoundFactory(match=match, round_number=1)
    MessageFactory(round=round_obj, match=match)

    response = auth_client.get(detail_url(match.id))

    assert response.status_code == 200
    assert response.data["topic"] == "Should AI write laws?"
    assert response.data["status"] == MatchStatus.AI_TURN
    assert len(response.data["rounds"]) == 1
    assert len(response.data["rounds"][0]["messages"]) == 1


def test_retrieve_match_returns_empty_rounds_list_when_no_messages_yet(
    auth_client, user
):
    match = MatchFactory(user=user)

    response = auth_client.get(detail_url(match.id))

    assert response.status_code == 200
    assert response.data["rounds"] == []


def test_retrieve_match_404_for_non_owner(auth_client, other_user):
    match = MatchFactory(user=other_user)

    response = auth_client.get(detail_url(match.id))

    assert response.status_code == 404


def test_retrieve_match_404_for_nonexistent(auth_client):
    response = auth_client.get(detail_url("00000000-0000-0000-0000-000000000000"))

    assert response.status_code == 404


def test_retrieve_match_requires_authentication(api_client, user):
    match = MatchFactory(user=user)

    response = api_client.get(detail_url(match.id))

    assert response.status_code == 403
