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
NEW_PASSWORD = "New1d!Pass"


def forgot_password_url():
    return reverse("auth-forgot-password")


def reset_password_url():
    return reverse("auth-reset-password")


@pytest.fixture
def registered_user(db):
    return User.objects.create_user(
        username="forgetful", email="forgetful@example.com", password=PASSWORD
    )


def sign(payload, secret=None, algorithm="HS256"):
    return jwt.encode(payload, secret or settings.JWT_SECRET_KEY, algorithm=algorithm)


def test_reset_password_email_contains_a_token_signed_for_the_user(
    api_client, registered_user
):
    api_client.post(forgot_password_url(), {"email": "forgetful@example.com"})

    token = extract_verification_token(mail.outbox[0])
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])

    assert payload["sub"] == registered_user.id
    assert payload["purpose"] == "password_reset"


def test_reset_rejects_token_signed_with_wrong_secret(api_client, registered_user):
    token = sign(
        {
            "sub": registered_user.id,
            "purpose": "password_reset",
            "exp": timezone.now() + timedelta(minutes=5),
        },
        secret="not-the-real-secret",
    )

    response = api_client.post(
        reset_password_url(), {"token": token, "password": NEW_PASSWORD}
    )

    assert response.status_code == 400


def test_reset_rejects_expired_token(api_client, registered_user):
    token = sign(
        {
            "sub": registered_user.id,
            "purpose": "password_reset",
            "exp": timezone.now() - timedelta(seconds=1),
        }
    )

    response = api_client.post(
        reset_password_url(), {"token": token, "password": NEW_PASSWORD}
    )

    assert response.status_code == 400


def test_reset_rejects_token_with_wrong_purpose(api_client, registered_user):
    token = sign(
        {
            "sub": registered_user.id,
            "purpose": "login_verification",
            "exp": timezone.now() + timedelta(minutes=5),
        }
    )

    response = api_client.post(
        reset_password_url(), {"token": token, "password": NEW_PASSWORD}
    )

    assert response.status_code == 400


def test_reset_rejects_token_for_a_deleted_user(api_client, registered_user):
    api_client.post(forgot_password_url(), {"email": "forgetful@example.com"})
    token = extract_verification_token(mail.outbox[0])
    registered_user.delete()

    response = api_client.post(
        reset_password_url(), {"token": token, "password": NEW_PASSWORD}
    )

    assert response.status_code == 400


def test_reset_token_is_rejected_by_login_verify_endpoint(api_client, registered_user):
    api_client.post(forgot_password_url(), {"email": "forgetful@example.com"})
    token = extract_verification_token(mail.outbox[0])

    response = api_client.post(reverse("auth-verify"), {"token": token})

    assert response.status_code == 400
