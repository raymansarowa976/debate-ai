import pytest

from apps.evaluations.ai.context import MAX_SUMMARIZED_ROUNDS, build_context_payload
from apps.matches.models import SenderType, Stance
from apps.matches.tests.factories import MatchFactory, MessageFactory, RoundFactory

pytestmark = pytest.mark.django_db


def words(n):
    return " ".join(["word"] * n)


def test_first_round_has_empty_summary_and_correct_latest_statement():
    match = MatchFactory(topic="Should AI write laws?", user_stance=Stance.FOR)
    round_1 = RoundFactory(match=match, round_number=1)
    MessageFactory(
        round=round_1, match=match, sender=SenderType.USER, content=words(60)
    )

    payload = build_context_payload(match)

    assert payload.rolling_summary == ""
    assert payload.latest_statement == words(60)
    assert payload.topic == "Should AI write laws?"
    assert payload.ai_stance == Stance.AGAINST


def test_old_rounds_are_summarized_and_latest_round_is_excluded():
    match = MatchFactory(user_stance=Stance.FOR)
    round_1 = RoundFactory(match=match, round_number=1)
    MessageFactory(
        round=round_1, match=match, sender=SenderType.USER, content="Taxes should rise."
    )
    MessageFactory(
        round=round_1,
        match=match,
        sender=SenderType.AI,
        content="Taxes should not rise.",
    )
    round_2 = RoundFactory(match=match, round_number=2)
    MessageFactory(
        round=round_2,
        match=match,
        sender=SenderType.USER,
        content="Latest user statement.",
    )

    payload = build_context_payload(match)

    assert "Round 1" in payload.rolling_summary
    assert "Taxes should rise" in payload.rolling_summary
    assert "Taxes should not rise" in payload.rolling_summary
    assert "Round 2" not in payload.rolling_summary
    assert payload.latest_statement == "Latest user statement."


def test_long_message_snippets_are_truncated():
    match = MatchFactory(user_stance=Stance.FOR)
    round_1 = RoundFactory(match=match, round_number=1)
    MessageFactory(
        round=round_1, match=match, sender=SenderType.USER, content=words(200)
    )
    MessageFactory(round=round_1, match=match, sender=SenderType.AI, content=words(200))
    round_2 = RoundFactory(match=match, round_number=2)
    MessageFactory(
        round=round_2, match=match, sender=SenderType.USER, content=words(60)
    )

    payload = build_context_payload(match)

    assert "..." in payload.rolling_summary
    assert words(200) not in payload.rolling_summary


def test_only_the_most_recent_old_rounds_are_summarized():
    match = MatchFactory(user_stance=Stance.FOR)
    total_old_rounds = MAX_SUMMARIZED_ROUNDS + 2
    for i in range(1, total_old_rounds + 1):
        round_obj = RoundFactory(match=match, round_number=i)
        MessageFactory(
            round=round_obj,
            match=match,
            sender=SenderType.USER,
            content=f"user-msg-{i}",
        )
        MessageFactory(
            round=round_obj, match=match, sender=SenderType.AI, content=f"ai-msg-{i}"
        )
    latest_round = RoundFactory(match=match, round_number=total_old_rounds + 1)
    MessageFactory(
        round=latest_round,
        match=match,
        sender=SenderType.USER,
        content="latest statement",
    )

    payload = build_context_payload(match)

    kept_start = total_old_rounds - MAX_SUMMARIZED_ROUNDS + 1
    for i in range(kept_start, total_old_rounds + 1):
        assert f"user-msg-{i}" in payload.rolling_summary
    for i in range(1, kept_start):
        assert f"user-msg-{i}" not in payload.rolling_summary
