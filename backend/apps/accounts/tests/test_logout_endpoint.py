import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse

from .helpers import extract_verification_token

pytestmark = pytest.mark.django_db

User = get_user_model()

PASSWORD = "Val1d!Pass"


def login_url():
    return reverse("auth-login")


def verify_url():
    return reverse("auth-verify")


def logout_url():
    return reverse("auth-logout")


def me_url():
    return reverse("auth-me")


@pytest.fixture
def logged_in_client(api_client, db):
    User.objects.create_user(
        username="logoutuser", email="logoutuser@example.com", password=PASSWORD
    )
    api_client.post(login_url(), {"identifier": "logoutuser", "password": PASSWORD})
    token = extract_verification_token(mail.outbox[-1])
    api_client.post(verify_url(), {"token": token})
    return api_client


def test_logout_clears_the_session(logged_in_client):
    response = logged_in_client.post(logout_url())

    assert response.status_code == 204

    follow_up = logged_in_client.get(me_url())
    assert follow_up.status_code == 403


def test_logout_requires_authentication(api_client):
    response = api_client.post(logout_url())

    assert response.status_code == 403
