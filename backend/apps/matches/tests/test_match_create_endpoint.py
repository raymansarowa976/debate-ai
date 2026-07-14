import pytest
from django.urls import reverse

from apps.matches.models import Match, MatchStatus, Stance

pytestmark = pytest.mark.django_db


def test_create_match_defaults_to_initialized_status(auth_client):
    response = auth_client.post(
        reverse("match-create"),
        {"topic": "Should AI write laws?", "user_stance": Stance.FOR},
    )

    assert response.status_code == 201
    assert response.data["status"] == MatchStatus.INITIALIZED
    assert Match.objects.get(id=response.data["id"]).status == MatchStatus.INITIALIZED


def test_create_match_requires_authentication(api_client):
    response = api_client.post(
        reverse("match-create"),
        {"topic": "Should AI write laws?", "user_stance": Stance.FOR},
    )

    assert response.status_code == 403


def test_create_match_persists_user_stance(auth_client):
    response = auth_client.post(
        reverse("match-create"),
        {"topic": "Should AI write laws?", "user_stance": Stance.AGAINST},
    )

    assert response.status_code == 201
    assert response.data["user_stance"] == Stance.AGAINST
    assert Match.objects.get(id=response.data["id"]).user_stance == Stance.AGAINST


def test_create_match_rejects_invalid_stance(auth_client):
    response = auth_client.post(
        reverse("match-create"),
        {"topic": "Should AI write laws?", "user_stance": "MAYBE"},
    )

    assert response.status_code == 400


def test_create_match_requires_stance(auth_client):
    response = auth_client.post(reverse("match-create"), {"topic": "Should AI write laws?"})

    assert response.status_code == 400
