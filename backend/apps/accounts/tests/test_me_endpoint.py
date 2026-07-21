import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db


def me_url():
    return reverse("auth-me")


def test_me_returns_current_user(auth_client, user):
    response = auth_client.get(me_url())

    assert response.status_code == 200
    assert response.data["username"] == user.username
    assert response.data["email"] == user.email
    assert response.data["id"] == user.id


def test_me_does_not_include_password(auth_client):
    response = auth_client.get(me_url())

    assert "password" not in response.data


def test_me_requires_authentication(api_client):
    response = api_client.get(me_url())

    assert response.status_code == 403
