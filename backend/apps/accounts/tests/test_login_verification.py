from datetime import timedelta

import jwt
import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse
from django.utils import timezone

from .helpers import extract_verification_token

pytestmark = pytest.mark.django_db

User = get_user_model()

PASSWORD = "Val1d!Pass"


def login_url():
    return reverse("auth-login")


def verify_url():
    return reverse("auth-verify")


def me_url():
    return reverse("auth-me")


@pytest.fixture
def registered_user(db):
    return User.objects.create_user(
        username="loginuser", email="loginuser@example.com", password=PASSWORD
    )


def sign(payload, secret=None, algorithm="HS256"):
    return jwt.encode(payload, secret or settings.JWT_SECRET_KEY, algorithm=algorithm)


def test_login_email_contains_a_token_signed_for_the_user(api_client, registered_user):
    api_client.post(login_url(), {"identifier": "loginuser", "password": PASSWORD})

    token = extract_verification_token(mail.outbox[0])
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])

    assert payload["sub"] == registered_user.id
    assert payload["purpose"] == "login_verification"


def test_verify_with_valid_token_establishes_a_session(api_client, registered_user):
    api_client.post(login_url(), {"identifier": "loginuser", "password": PASSWORD})
    token = extract_verification_token(mail.outbox[0])

    response = api_client.post(verify_url(), {"token": token})

    assert response.status_code == 200
    assert response.data["username"] == "loginuser"

    follow_up = api_client.get(me_url())
    assert follow_up.status_code == 200
    assert follow_up.data["username"] == "loginuser"


def test_verify_requires_a_token(api_client):
    response = api_client.post(verify_url(), {})

    assert response.status_code == 400


def test_verify_rejects_garbage_token(api_client):
    response = api_client.post(verify_url(), {"token": "not-a-real-token"})

    assert response.status_code == 400

    follow_up = api_client.get(me_url())
    assert follow_up.status_code == 403


def test_verify_rejects_token_signed_with_wrong_secret(api_client, registered_user):
    token = sign(
        {
            "sub": registered_user.id,
            "purpose": "login_verification",
            "exp": timezone.now() + timedelta(minutes=5),
        },
        secret="not-the-real-secret",
    )

    response = api_client.post(verify_url(), {"token": token})

    assert response.status_code == 400


def test_verify_rejects_expired_token(api_client, registered_user):
    token = sign(
        {
            "sub": registered_user.id,
            "purpose": "login_verification",
            "exp": timezone.now() - timedelta(seconds=1),
        }
    )

    response = api_client.post(verify_url(), {"token": token})

    assert response.status_code == 400


def test_verify_rejects_token_with_wrong_purpose(api_client, registered_user):
    token = sign(
        {
            "sub": registered_user.id,
            "purpose": "password_reset",
            "exp": timezone.now() + timedelta(minutes=5),
        }
    )

    response = api_client.post(verify_url(), {"token": token})

    assert response.status_code == 400


def test_verify_rejects_token_for_a_deleted_user(api_client, registered_user):
    api_client.post(login_url(), {"identifier": "loginuser", "password": PASSWORD})
    token = extract_verification_token(mail.outbox[0])
    registered_user.delete()

    response = api_client.post(verify_url(), {"token": token})

    assert response.status_code == 400


def test_verify_token_cannot_be_reused(api_client, registered_user):
    api_client.post(login_url(), {"identifier": "loginuser", "password": PASSWORD})
    token = extract_verification_token(mail.outbox[0])

    first = api_client.post(verify_url(), {"token": token})
    assert first.status_code == 200

    api_client.post(reverse("auth-logout"))

    second = api_client.post(verify_url(), {"token": token})
    assert second.status_code == 400

    follow_up = api_client.get(me_url())
    assert follow_up.status_code == 403


def test_logging_in_again_invalidates_the_previous_token(api_client, registered_user):
    api_client.post(login_url(), {"identifier": "loginuser", "password": PASSWORD})
    stale_token = extract_verification_token(mail.outbox[0])

    api_client.post(login_url(), {"identifier": "loginuser", "password": PASSWORD})

    response = api_client.post(verify_url(), {"token": stale_token})

    assert response.status_code == 400
