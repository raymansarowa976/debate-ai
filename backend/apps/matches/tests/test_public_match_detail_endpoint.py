import pytest
from django.urls import reverse

from apps.matches.models import MatchStatus
from apps.matches.sharing import generate_share_slug
from apps.matches.tests.factories import MatchFactory, MessageFactory, RoundFactory

pytestmark = pytest.mark.django_db


def public_detail_url(share_slug):
    return reverse("match-public-detail", kwargs={"share_slug": share_slug})


def shared_match(**kwargs):
    return MatchFactory(is_public=True, share_slug=generate_share_slug(), **kwargs)


def test_match_defaults_to_private_and_slugless_on_creation(user):
    match = MatchFactory(user=user)

    assert match.is_public is False
    assert match.share_slug is None


def test_public_detail_is_accessible_without_authentication(api_client):
    match = shared_match(topic="Should AI write laws?")

    response = api_client.get(public_detail_url(match.share_slug))

    assert response.status_code == 200
    assert response.data["topic"] == "Should AI write laws?"


def test_public_detail_returns_rounds_and_messages_timeline(api_client):
    match = shared_match(status=MatchStatus.COMPLETED)
    round_obj = RoundFactory(match=match, round_number=1)
    MessageFactory(round=round_obj, match=match, content="An opening argument here.")

    response = api_client.get(public_detail_url(match.share_slug))

    assert response.status_code == 200
    assert len(response.data["rounds"]) == 1
    assert len(response.data["rounds"][0]["messages"]) == 1
    assert (
        response.data["rounds"][0]["messages"][0]["content"]
        == "An opening argument here."
    )


def test_public_detail_excludes_user_identifying_and_sequential_id_fields(api_client):
    match = shared_match()
    round_obj = RoundFactory(match=match, round_number=1)
    MessageFactory(round=round_obj, match=match)

    response = api_client.get(public_detail_url(match.share_slug))

    assert response.status_code == 200
    body = response.data
    # No user identity of any kind (email, username, internal user id).
    assert "user" not in body
    assert "user_id" not in body
    assert "email" not in body
    assert "username" not in body
    # No internal database identifiers, sequential or otherwise.
    assert "id" not in body
    for round_data in body["rounds"]:
        assert "id" not in round_data
        for message_data in round_data["messages"]:
            assert "id" not in message_data


def test_public_detail_404_for_private_match_even_with_valid_looking_slug(api_client):
    match = MatchFactory(is_public=False, share_slug=generate_share_slug())

    response = api_client.get(public_detail_url(match.share_slug))

    assert response.status_code == 404


def test_public_detail_404_for_unknown_slug(api_client):
    response = api_client.get(public_detail_url(generate_share_slug()))

    assert response.status_code == 404


def test_public_detail_404_for_malformed_slug(api_client):
    response = api_client.get("/api/matches/public/not-a-real-slug-format/")

    assert response.status_code == 404
