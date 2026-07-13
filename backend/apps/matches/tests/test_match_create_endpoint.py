import pytest
from django.urls import reverse

from apps.matches.models import Match, MatchStatus

pytestmark = pytest.mark.django_db


def test_create_match_defaults_to_initialized_status(auth_client):
    response = auth_client.post(
        reverse("match-create"), {"topic": "Should AI write laws?"}
    )

    assert response.status_code == 201
    assert response.data["status"] == MatchStatus.INITIALIZED
    assert Match.objects.get(id=response.data["id"]).status == MatchStatus.INITIALIZED


def test_create_match_requires_authentication(api_client):
    response = api_client.post(reverse("match-create"), {"topic": "Should AI write laws?"})

    assert response.status_code == 403
