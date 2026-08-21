from unittest.mock import patch

import pytest

from apps.evaluations.ai.client import FALLBACK_MESSAGE
from apps.matches.models import MatchStatus, Message, SenderType, Stance
from apps.matches.tasks import generate_ai_turn_task
from apps.matches.tests.factories import MatchFactory, MessageFactory, RoundFactory

pytestmark = pytest.mark.django_db

# Patching at the defining module affects the single shared Celery Task instance,
# mirroring the convention used for evaluate_match_task in evaluations/tasks.py.
REPLY_TARGET = "apps.matches.tasks.generate_opponent_reply"


def _match_in_ai_turn(**kwargs):
    return MatchFactory(status=MatchStatus.AI_TURN, **kwargs)


def test_saves_the_ai_reply_in_the_given_round_and_returns_to_user_turn():
    match = _match_in_ai_turn()
    round_obj = RoundFactory(match=match, round_number=1)
    MessageFactory(round=round_obj, match=match, sender=SenderType.USER)

    with patch(REPLY_TARGET, return_value="Not so fast."):
        generate_ai_turn_task.apply(args=[str(match.id), round_obj.id])

    match.refresh_from_db()
    assert match.status == MatchStatus.USER_TURN
    ai_message = Message.objects.get(match=match, sender=SenderType.AI)
    assert ai_message.round_id == round_obj.id
    assert ai_message.content == "Not so fast."
    assert Message.objects.filter(match=match, sender=SenderType.USER).count() == 1


def test_attaches_the_reply_to_the_given_round_when_other_rounds_exist():
    match = _match_in_ai_turn()
    RoundFactory(match=match, round_number=1)
    round_two = RoundFactory(match=match, round_number=2)

    with patch(REPLY_TARGET, return_value="reply"):
        generate_ai_turn_task.apply(args=[str(match.id), round_two.id])

    ai_message = Message.objects.get(match=match, sender=SenderType.AI)
    assert ai_message.round_id == round_two.id


def test_uses_the_matchs_topic_and_ai_stance_in_the_system_prompt():
    match = _match_in_ai_turn(topic="Should AI write laws?", user_stance=Stance.FOR)
    round_obj = RoundFactory(match=match, round_number=1)

    with patch(REPLY_TARGET, return_value="reply") as mock_reply:
        generate_ai_turn_task.apply(args=[str(match.id), round_obj.id])

    system_prompt = mock_reply.call_args.args[0]
    assert "Should AI write laws?" in system_prompt
    assert "AGAINST" in system_prompt


def test_includes_match_context_in_the_payload_sent_to_the_opponent():
    match = _match_in_ai_turn()
    round_obj = RoundFactory(match=match, round_number=1)
    MessageFactory(
        round=round_obj,
        match=match,
        sender=SenderType.USER,
        content=" ".join(["distinctive"] * 60),
    )

    with patch(REPLY_TARGET, return_value="reply") as mock_reply:
        generate_ai_turn_task.apply(args=[str(match.id), round_obj.id])

    context_payload = mock_reply.call_args.args[1]
    assert "distinctive" in context_payload.latest_statement


def test_falls_back_to_the_fallback_message_and_still_advances_the_match_when_the_llm_call_fails():
    match = _match_in_ai_turn()
    round_obj = RoundFactory(match=match, round_number=1)

    with patch(REPLY_TARGET, return_value=FALLBACK_MESSAGE):
        generate_ai_turn_task.apply(args=[str(match.id), round_obj.id])

    match.refresh_from_db()
    assert match.status == MatchStatus.USER_TURN
    ai_message = Message.objects.get(match=match, sender=SenderType.AI)
    assert ai_message.content == FALLBACK_MESSAGE
