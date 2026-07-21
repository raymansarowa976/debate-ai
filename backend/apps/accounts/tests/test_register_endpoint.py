import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from apps.matches.tests.factories import UserFactory

pytestmark = pytest.mark.django_db

User = get_user_model()

VALID_PASSWORD = "Val1d!Pass"


def register_url():
    return reverse("auth-register")


def me_url():
    return reverse("auth-me")


def valid_payload(**overrides):
    payload = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": VALID_PASSWORD,
    }
    payload.update(overrides)
    return payload


def test_register_creates_user_and_returns_201(api_client):
    response = api_client.post(register_url(), valid_payload())

    assert response.status_code == 201
    assert User.objects.filter(
        username="newuser", email="newuser@example.com"
    ).exists()


def test_register_response_does_not_include_password(api_client):
    response = api_client.post(register_url(), valid_payload())

    assert "password" not in response.data


def test_register_hashes_the_password(api_client):
    api_client.post(register_url(), valid_payload())

    user = User.objects.get(username="newuser")
    assert user.password != VALID_PASSWORD
    assert user.check_password(VALID_PASSWORD)


def test_register_logs_the_user_in(api_client):
    api_client.post(register_url(), valid_payload())

    response = api_client.get(me_url())

    assert response.status_code == 200
    assert response.data["username"] == "newuser"


def test_register_requires_username(api_client):
    response = api_client.post(register_url(), valid_payload(username=""))

    assert response.status_code == 400
    assert "username" in response.data


def test_register_requires_email(api_client):
    response = api_client.post(register_url(), valid_payload(email=""))

    assert response.status_code == 400
    assert "email" in response.data


def test_register_requires_password(api_client):
    response = api_client.post(register_url(), valid_payload(password=""))

    assert response.status_code == 400
    assert "password" in response.data


def test_register_rejects_username_shorter_than_3_characters(api_client):
    response = api_client.post(register_url(), valid_payload(username="ab"))

    assert response.status_code == 400
    assert "username" in response.data


def test_register_accepts_username_at_minimum_length(api_client):
    response = api_client.post(register_url(), valid_payload(username="abc"))

    assert response.status_code == 201


def test_register_rejects_duplicate_username_case_insensitively(api_client):
    UserFactory(username="TakenName", email="other@example.com")

    response = api_client.post(register_url(), valid_payload(username="takenname"))

    assert response.status_code == 400
    assert "username" in response.data


def test_register_rejects_invalid_email_format(api_client):
    response = api_client.post(register_url(), valid_payload(email="not-an-email"))

    assert response.status_code == 400
    assert "email" in response.data


def test_register_rejects_duplicate_email_case_insensitively(api_client):
    UserFactory(username="someoneelse", email="Dup@Example.com")

    response = api_client.post(register_url(), valid_payload(email="dup@example.com"))

    assert response.status_code == 400
    assert "email" in response.data


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
def test_register_rejects_password_missing_a_requirement(api_client, password):
    response = api_client.post(register_url(), valid_payload(password=password))

    assert response.status_code == 400
    assert "password" in response.data


def test_register_accepts_password_meeting_all_requirements(api_client):
    response = api_client.post(register_url(), valid_payload(password="Val1d!Pass"))

    assert response.status_code == 201
