import json
from unittest.mock import patch

import pytest

from apps.evaluations.events import GradingEvent
from apps.evaluations.models import Scorecard
from apps.evaluations.tasks import ScorecardValidationError, evaluate_match_task
from apps.matches.models import MatchStatus
from apps.matches.tests.factories import MatchFactory

pytestmark = pytest.mark.django_db

# Patching at the defining module affects the single shared Celery Task instance,
# mirroring the convention used for evaluate_match_task.delay in the matches tests.
JUDGE_TARGET = "apps.evaluations.tasks.generate_scorecard_response"
PUBLISH_TARGET = "apps.evaluations.tasks.publish_grading_event"


def _valid_response():
    return json.dumps(
        {
            "logic": 80,
            "evidence": 70,
            "rhetoric": 65,
            "adherence": 90,
            "fallacies_detected": [
                {"type": "strawman", "explanation": "Misrepresented the claim."}
            ],
        }
    )


def _match_in_evaluating(**kwargs):
    return MatchFactory(status=MatchStatus.EVALUATING, **kwargs)


def test_task_retries_with_exponential_backoff_capped_at_three_attempts():
    assert evaluate_match_task.max_retries == 3
    assert evaluate_match_task.retry_backoff is True
    assert ScorecardValidationError in evaluate_match_task.autoretry_for


def test_valid_scorecard_completes_the_match_and_persists_the_scorecard():
    match = _match_in_evaluating()

    with patch(JUDGE_TARGET, return_value=_valid_response()):
        evaluate_match_task.apply(args=[str(match.id)])

    match.refresh_from_db()
    assert match.status == MatchStatus.COMPLETED

    scorecard = Scorecard.objects.get(match=match)
    assert scorecard.logic_score == 80
    assert scorecard.evidence_score == 70
    assert scorecard.rhetoric_score == 65
    assert scorecard.adherence_score == 90
    assert scorecard.fallacies == [
        {"type": "strawman", "explanation": "Misrepresented the claim."}
    ]


def test_updates_an_existing_scorecard_rather_than_duplicating_it():
    match = _match_in_evaluating()
    Scorecard.objects.create(
        match=match,
        logic_score=10,
        evidence_score=10,
        rhetoric_score=10,
        adherence_score=10,
    )

    with patch(JUDGE_TARGET, return_value=_valid_response()):
        evaluate_match_task.apply(args=[str(match.id)])

    assert Scorecard.objects.filter(match=match).count() == 1
    scorecard = Scorecard.objects.get(match=match)
    assert scorecard.logic_score == 80


def test_malformed_json_is_retried_and_eventually_fails_without_corrupting_the_match():
    match = _match_in_evaluating()

    with patch(JUDGE_TARGET, return_value="{not valid json") as mock_judge:
        result = evaluate_match_task.apply(args=[str(match.id)])

    assert result.failed()
    assert mock_judge.call_count == 4  # initial attempt + 3 retries
    match.refresh_from_db()
    assert match.status == MatchStatus.EVALUATING
    assert not Scorecard.objects.filter(match=match).exists()


def test_schema_violation_is_retried_and_eventually_fails_without_corrupting_the_match():
    match = _match_in_evaluating()
    invalid_response = json.dumps(
        {
            "logic": "not-a-number",
            "evidence": 70,
            "rhetoric": 65,
            "adherence": 90,
            "fallacies_detected": [],
        }
    )

    with patch(JUDGE_TARGET, return_value=invalid_response) as mock_judge:
        result = evaluate_match_task.apply(args=[str(match.id)])

    assert result.failed()
    assert mock_judge.call_count == 4
    match.refresh_from_db()
    assert match.status == MatchStatus.EVALUATING
    assert not Scorecard.objects.filter(match=match).exists()


def test_valid_scorecard_publishes_the_grading_steps_in_order():
    match = _match_in_evaluating()

    with patch(JUDGE_TARGET, return_value=_valid_response()), patch(
        PUBLISH_TARGET
    ) as mock_publish:
        evaluate_match_task.apply(args=[str(match.id)])

    assert [call.args[1] for call in mock_publish.call_args_list] == [
        GradingEvent.JUDGE_START,
        GradingEvent.LOGIC_EVALUATED,
        GradingEvent.FINAL_COMPILATION,
    ]
    for call in mock_publish.call_args_list:
        assert call.args[0] == str(match.id)


def test_malformed_json_never_publishes_logic_evaluated_or_final_compilation():
    match = _match_in_evaluating()

    with patch(JUDGE_TARGET, return_value="{not valid json"), patch(
        PUBLISH_TARGET
    ) as mock_publish:
        evaluate_match_task.apply(args=[str(match.id)])

    published_events = [call.args[1] for call in mock_publish.call_args_list]
    assert published_events.count(GradingEvent.JUDGE_START) == 4
    assert GradingEvent.LOGIC_EVALUATED not in published_events
    assert GradingEvent.FINAL_COMPILATION not in published_events


def test_recovers_after_transient_invalid_json_followed_by_a_valid_response():
    match = _match_in_evaluating()

    with patch(
        JUDGE_TARGET, side_effect=["not json", "still not json", _valid_response()]
    ) as mock_judge:
        result = evaluate_match_task.apply(args=[str(match.id)])

    assert not result.failed()
    assert mock_judge.call_count == 3
    match.refresh_from_db()
    assert match.status == MatchStatus.COMPLETED
    assert Scorecard.objects.filter(match=match).exists()
