import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse

pytestmark = pytest.mark.django_db

User = get_user_model()

PASSWORD = "Val1d!Pass"


def login_url():
    return reverse("auth-login")


def me_url():
    return reverse("auth-me")


@pytest.fixture
def registered_user(db):
    return User.objects.create_user(
        username="loginuser", email="loginuser@example.com", password=PASSWORD
    )


def test_login_with_username_sends_a_verification_email(api_client, registered_user):
    response = api_client.post(
        login_url(), {"identifier": "loginuser", "password": PASSWORD}
    )

    assert response.status_code == 200
    assert response.data["verification_required"] is True
    assert len(mail.outbox) == 1
    assert mail.outbox[0].to == ["loginuser@example.com"]


def test_login_with_email_sends_a_verification_email(api_client, registered_user):
    response = api_client.post(
        login_url(), {"identifier": "loginuser@example.com", "password": PASSWORD}
    )

    assert response.status_code == 200
    assert len(mail.outbox) == 1


def test_login_with_email_is_case_insensitive(api_client, registered_user):
    response = api_client.post(
        login_url(), {"identifier": "LoginUser@Example.com", "password": PASSWORD}
    )

    assert response.status_code == 200


def test_login_does_not_establish_a_session_until_verified(api_client, registered_user):
    api_client.post(login_url(), {"identifier": "loginuser", "password": PASSWORD})

    response = api_client.get(me_url())

    assert response.status_code == 403


def test_login_rejects_wrong_password(api_client, registered_user):
    response = api_client.post(
        login_url(), {"identifier": "loginuser", "password": "WrongPass1!"}
    )

    assert response.status_code == 400


def test_login_rejects_wrong_password_without_sending_an_email(
    api_client, registered_user
):
    api_client.post(
        login_url(), {"identifier": "loginuser", "password": "WrongPass1!"}
    )

    assert len(mail.outbox) == 0


def test_login_rejects_unknown_identifier(api_client):
    response = api_client.post(
        login_url(), {"identifier": "ghost", "password": PASSWORD}
    )

    assert response.status_code == 400


def test_login_requires_identifier(api_client):
    response = api_client.post(login_url(), {"password": PASSWORD})

    assert response.status_code == 400


def test_login_requires_password(api_client):
    response = api_client.post(login_url(), {"identifier": "loginuser"})

    assert response.status_code == 400


def test_login_does_not_leak_whether_identifier_exists(api_client, registered_user):
    unknown = api_client.post(
        login_url(), {"identifier": "ghost", "password": "whatever1A!"}
    )
    wrong_password = api_client.post(
        login_url(), {"identifier": "loginuser", "password": "whatever1A!"}
    )

    assert unknown.data == wrong_password.data
