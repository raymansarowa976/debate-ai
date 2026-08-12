import re

import pytest
from django.urls import reverse

from apps.matches.sharing import SLUG_PATTERN
from apps.matches.tests.factories import MatchFactory

pytestmark = pytest.mark.django_db

SLUG_FULL_MATCH = re.compile(rf"^{SLUG_PATTERN}$")


def share_url(match_id):
    return reverse("match-share", kwargs={"match_id": match_id})


def test_post_share_makes_match_public_and_returns_share_slug(auth_client, user):
    match = MatchFactory(user=user)

    response = auth_client.post(share_url(match.id))

    assert response.status_code == 200
    match.refresh_from_db()
    assert match.is_public is True
    assert SLUG_FULL_MATCH.match(match.share_slug)
    assert response.data["share_slug"] == match.share_slug


def test_post_share_is_idempotent_and_keeps_same_slug(auth_client, user):
    match = MatchFactory(user=user)

    first_response = auth_client.post(share_url(match.id))
    second_response = auth_client.post(share_url(match.id))

    assert first_response.data["share_slug"] == second_response.data["share_slug"]


def test_post_share_requires_authentication(api_client, user):
    match = MatchFactory(user=user)

    response = api_client.post(share_url(match.id))

    assert response.status_code == 403
    match.refresh_from_db()
    assert match.is_public is False
    assert match.share_slug is None


def test_post_share_returns_404_for_non_owner(auth_client, other_user):
    match = MatchFactory(user=other_user)

    response = auth_client.post(share_url(match.id))

    assert response.status_code == 404
    match.refresh_from_db()
    assert match.is_public is False


def test_post_share_returns_404_for_nonexistent_match(auth_client):
    response = auth_client.post(share_url("00000000-0000-0000-0000-000000000000"))

    assert response.status_code == 404
