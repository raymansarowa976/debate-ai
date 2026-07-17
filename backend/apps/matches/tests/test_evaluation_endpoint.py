import time
from unittest.mock import patch

import pytest
from django.urls import reverse

from apps.matches.models import Match, MatchStatus, Message, Round, SenderType
from apps.matches.tests.factories import MatchFactory, RoundFactory

pytestmark = pytest.mark.django_db

# Patching the task object at its defining module affects the single shared
# Celery Task instance regardless of how the view imports/calls it.
TASK_DELAY_TARGET = "apps.evaluations.tasks.evaluate_match_task.delay"


def words(n):
    return " ".join(["word"] * n)


def evaluate_url(match_id):
    return reverse("match-evaluate", kwargs={"match_id": match_id})


def test_post_evaluate_when_initialized_transitions_to_evaluating_creates_round_and_message(
    auth_client, user
):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    with patch(TASK_DELAY_TARGET) as mock_delay:
        response = auth_client.post(evaluate_url(match.id), {"content": words(60)})

    assert response.status_code == 202
    match.refresh_from_db()
    assert match.status == MatchStatus.EVALUATING
    assert Round.objects.filter(match=match).count() == 1
    round_obj = Round.objects.get(match=match)
    assert (
        Message.objects.filter(
            match=match, round=round_obj, sender=SenderType.USER
        ).count()
        == 1
    )
    mock_delay.assert_called_once_with(str(match.id))


def test_post_evaluate_when_user_turn_opens_final_round(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.USER_TURN)
    RoundFactory(match=match, round_number=1)

    with patch(TASK_DELAY_TARGET) as mock_delay:
        response = auth_client.post(evaluate_url(match.id), {"content": words(60)})

    assert response.status_code == 202
    new_round = Round.objects.get(match=match, round_number=2)
    assert Message.objects.filter(round=new_round).exists()
    mock_delay.assert_called_once_with(str(match.id))


@pytest.mark.parametrize(
    "status", [MatchStatus.AI_TURN, MatchStatus.EVALUATING, MatchStatus.COMPLETED]
)
def test_post_evaluate_returns_409_when_not_open_for_user_turn(
    auth_client, user, status
):
    match = MatchFactory(user=user, status=status)

    with patch(TASK_DELAY_TARGET) as mock_delay:
        response = auth_client.post(evaluate_url(match.id), {"content": words(60)})

    assert response.status_code == 409
    match.refresh_from_db()
    assert match.status == status
    assert not Round.objects.filter(match=match).exists()
    assert not Message.objects.filter(match=match).exists()
    mock_delay.assert_not_called()


def test_post_evaluate_rejects_under_50_words(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    with patch(TASK_DELAY_TARGET) as mock_delay:
        response = auth_client.post(evaluate_url(match.id), {"content": words(49)})

    assert response.status_code == 400
    match.refresh_from_db()
    assert match.status == MatchStatus.INITIALIZED
    assert not Message.objects.filter(match=match).exists()
    mock_delay.assert_not_called()


def test_post_evaluate_accepts_exactly_50_words(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    with patch(TASK_DELAY_TARGET):
        response = auth_client.post(evaluate_url(match.id), {"content": words(50)})

    assert response.status_code == 202


def test_post_evaluate_rejects_over_500_words(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    with patch(TASK_DELAY_TARGET) as mock_delay:
        response = auth_client.post(evaluate_url(match.id), {"content": words(501)})

    assert response.status_code == 400
    mock_delay.assert_not_called()


def test_post_evaluate_accepts_exactly_500_words(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    with patch(TASK_DELAY_TARGET):
        response = auth_client.post(evaluate_url(match.id), {"content": words(500)})

    assert response.status_code == 202


def test_post_evaluate_requires_authentication(api_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    response = api_client.post(evaluate_url(match.id), {"content": words(60)})

    assert response.status_code == 403


def test_post_evaluate_returns_404_for_non_owner_match(auth_client, other_user):
    match = MatchFactory(user=other_user, status=MatchStatus.INITIALIZED)

    with patch(TASK_DELAY_TARGET) as mock_delay:
        response = auth_client.post(evaluate_url(match.id), {"content": words(60)})

    assert response.status_code == 404
    mock_delay.assert_not_called()


def test_post_evaluate_returns_404_for_nonexistent_match(auth_client):
    with patch(TASK_DELAY_TARGET) as mock_delay:
        response = auth_client.post(
            evaluate_url("00000000-0000-0000-0000-000000000000"), {"content": words(60)}
        )

    assert response.status_code == 404
    mock_delay.assert_not_called()


def test_post_evaluate_forces_sender_to_user_regardless_of_payload(auth_client, user):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    with patch(TASK_DELAY_TARGET):
        response = auth_client.post(
            evaluate_url(match.id), {"content": words(60), "sender": SenderType.AI}
        )

    assert response.status_code == 202
    message = Message.objects.get(match=match)
    assert message.sender == SenderType.USER


def test_post_evaluate_dispatches_task_with_json_serializable_match_id(
    auth_client, user
):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    with patch(TASK_DELAY_TARGET) as mock_delay:
        auth_client.post(evaluate_url(match.id), {"content": words(60)})

    args, kwargs = mock_delay.call_args
    assert args == (str(match.id),)
    assert isinstance(args[0], str)


def test_post_evaluate_returns_202_promptly_without_blocking_on_task_execution(
    auth_client, user
):
    match = MatchFactory(user=user, status=MatchStatus.INITIALIZED)

    with patch(TASK_DELAY_TARGET) as mock_delay:
        start = time.perf_counter()
        response = auth_client.post(evaluate_url(match.id), {"content": words(60)})
        elapsed = time.perf_counter() - start

    assert response.status_code == 202
    assert elapsed < 0.2
    mock_delay.assert_called_once()
