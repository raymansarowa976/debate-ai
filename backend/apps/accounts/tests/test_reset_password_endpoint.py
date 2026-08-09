import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse

from .helpers import extract_verification_token

pytestmark = pytest.mark.django_db

User = get_user_model()

OLD_PASSWORD = "Val1d!Pass"
NEW_PASSWORD = "New1d!Pass"


def forgot_password_url():
    return reverse("auth-forgot-password")


def reset_password_url():
    return reverse("auth-reset-password")


def login_url():
    return reverse("auth-login")


@pytest.fixture
def registered_user(db):
    return User.objects.create_user(
        username="forgetful", email="forgetful@example.com", password=OLD_PASSWORD
    )


@pytest.fixture
def reset_token(api_client, registered_user):
    api_client.post(forgot_password_url(), {"email": "forgetful@example.com"})
    return extract_verification_token(mail.outbox[0])


def test_reset_password_with_valid_token_changes_the_password(
    api_client, registered_user, reset_token
):
    response = api_client.post(
        reset_password_url(), {"token": reset_token, "password": NEW_PASSWORD}
    )

    assert response.status_code == 200
    registered_user.refresh_from_db()
    assert registered_user.check_password(NEW_PASSWORD)
    assert not registered_user.check_password(OLD_PASSWORD)


def test_reset_password_allows_login_with_the_new_password(
    api_client, registered_user, reset_token
):
    api_client.post(
        reset_password_url(), {"token": reset_token, "password": NEW_PASSWORD}
    )

    response = api_client.post(
        login_url(), {"identifier": "forgetful", "password": NEW_PASSWORD}
    )

    assert response.status_code == 200


def test_reset_password_requires_a_token(api_client):
    response = api_client.post(reset_password_url(), {"password": NEW_PASSWORD})

    assert response.status_code == 400


def test_reset_password_requires_a_password(api_client, reset_token):
    response = api_client.post(reset_password_url(), {"token": reset_token})

    assert response.status_code == 400


def test_reset_password_rejects_garbage_token(api_client):
    response = api_client.post(
        reset_password_url(), {"token": "not-a-real-token", "password": NEW_PASSWORD}
    )

    assert response.status_code == 400


def test_reset_password_token_cannot_be_reused(api_client, registered_user, reset_token):
    first = api_client.post(
        reset_password_url(), {"token": reset_token, "password": NEW_PASSWORD}
    )
    assert first.status_code == 200

    second = api_client.post(
        reset_password_url(), {"token": reset_token, "password": "Another1!Pass"}
    )
    assert second.status_code == 400

    registered_user.refresh_from_db()
    assert registered_user.check_password(NEW_PASSWORD)


def test_requesting_a_new_reset_invalidates_the_previous_token(
    api_client, registered_user, reset_token
):
    api_client.post(forgot_password_url(), {"email": "forgetful@example.com"})

    response = api_client.post(
        reset_password_url(), {"token": reset_token, "password": NEW_PASSWORD}
    )

    assert response.status_code == 400


@pytest.mark.parametrize(
    "password",
    [
        "Sh0rt!",  # under 8 characters
        "alllower1!",  # missing uppercase
        "ALLUPPER1!",  # missing lowercase
        "NoDigits!!",  # missing a digit
        "NoSpecial1Aa",  # missing a special character
    ],
)
def test_reset_password_rejects_password_missing_a_requirement(
    api_client, reset_token, password
):
    response = api_client.post(
        reset_password_url(), {"token": reset_token, "password": password}
    )

    assert response.status_code == 400
