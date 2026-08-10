import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse

pytestmark = pytest.mark.django_db

User = get_user_model()

PASSWORD = "Val1d!Pass"


def forgot_password_url():
    return reverse("auth-forgot-password")


@pytest.fixture
def registered_user(db):
    return User.objects.create_user(
        username="forgetful", email="forgetful@example.com", password=PASSWORD
    )


def test_forgot_password_with_known_email_sends_an_email(api_client, registered_user):
    response = api_client.post(
        forgot_password_url(), {"email": "forgetful@example.com"}
    )

    assert response.status_code == 200
    assert len(mail.outbox) == 1
    assert mail.outbox[0].to == ["forgetful@example.com"]


def test_forgot_password_email_contains_username_and_reset_link(
    api_client, registered_user
):
    api_client.post(forgot_password_url(), {"email": "forgetful@example.com"})

    body = mail.outbox[0].body
    assert "forgetful" in body
    assert "token=" in body


def test_forgot_password_is_case_insensitive(api_client, registered_user):
    response = api_client.post(
        forgot_password_url(), {"email": "Forgetful@Example.com"}
    )

    assert response.status_code == 200
    assert len(mail.outbox) == 1


def test_forgot_password_with_unknown_email_does_not_send_an_email(api_client):
    response = api_client.post(
        forgot_password_url(), {"email": "nobody@example.com"}
    )

    assert response.status_code == 200
    assert len(mail.outbox) == 0


def test_forgot_password_does_not_leak_whether_email_exists(
    api_client, registered_user
):
    known = api_client.post(
        forgot_password_url(), {"email": "forgetful@example.com"}
    )
    unknown = api_client.post(
        forgot_password_url(), {"email": "nobody@example.com"}
    )

    assert known.status_code == unknown.status_code == 200
    assert known.data == unknown.data


def test_forgot_password_requires_email(api_client):
    response = api_client.post(forgot_password_url(), {})

    assert response.status_code == 400


def test_forgot_password_rejects_invalid_email_format(api_client):
    response = api_client.post(forgot_password_url(), {"email": "not-an-email"})

    assert response.status_code == 400
