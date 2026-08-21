from unittest.mock import MagicMock, patch

import pytest

from apps.evaluations.ai.client import (
    FALLBACK_MESSAGE,
    generate_opponent_reply,
    generate_scorecard_response,
)
from apps.evaluations.ai.context import ContextPayload
from apps.evaluations.ai.prompts import JUDGE_SYSTEM_PROMPT
from apps.evaluations.ai.schemas import FallacyDetail, ScorecardSchema

ANTHROPIC_CLS = "apps.evaluations.ai.client.anthropic.Anthropic"


def _payload():
    return ContextPayload(
        topic="Should AI write laws?",
        ai_stance="AGAINST",
        rolling_summary='Round 1 — User argued: "yes" — AI argued: "no".',
        latest_statement="AI should never write binding law.",
    )


def _text_response(text):
    response = MagicMock()
    response.content = [MagicMock(type="text", text=text)]
    return response


def _scorecard():
    return ScorecardSchema(
        logic=80,
        evidence=70,
        rhetoric=60,
        adherence=90,
        fallacies_detected=[
            FallacyDetail(type="strawman", explanation="Misrepresented the claim.")
        ],
    )


@patch(ANTHROPIC_CLS)
def test_returns_the_model_reply_on_success(mock_anthropic_cls):
    mock_client = MagicMock()
    mock_client.messages.create.return_value = _text_response("Nice try, but no.")
    mock_anthropic_cls.return_value = mock_client

    reply = generate_opponent_reply("system prompt text", _payload())

    assert reply == "Nice try, but no."


@patch(ANTHROPIC_CLS)
def test_client_is_constructed_with_the_configured_timeout(mock_anthropic_cls):
    mock_client = MagicMock()
    mock_client.messages.create.return_value = _text_response("reply")
    mock_anthropic_cls.return_value = mock_client

    generate_opponent_reply("system prompt text", _payload())

    _, kwargs = mock_anthropic_cls.call_args
    assert kwargs["timeout"] == 8


@patch(ANTHROPIC_CLS)
def test_request_uses_the_configured_model_and_system_prompt(mock_anthropic_cls):
    mock_client = MagicMock()
    mock_client.messages.create.return_value = _text_response("reply")
    mock_anthropic_cls.return_value = mock_client

    generate_opponent_reply("You must argue AGAINST the topic.", _payload())

    _, kwargs = mock_client.messages.create.call_args
    assert kwargs["model"] == "claude-haiku-4-5"
    assert kwargs["system"] == "You must argue AGAINST the topic."


@patch(ANTHROPIC_CLS)
def test_request_payload_contains_the_context_in_the_user_message(mock_anthropic_cls):
    mock_client = MagicMock()
    mock_client.messages.create.return_value = _text_response("reply")
    mock_anthropic_cls.return_value = mock_client
    payload = _payload()

    generate_opponent_reply("system prompt text", payload)

    _, kwargs = mock_client.messages.create.call_args
    messages = kwargs["messages"]
    assert messages[0]["role"] == "user"
    assert payload.rolling_summary in messages[0]["content"]
    assert payload.latest_statement in messages[0]["content"]


@patch(ANTHROPIC_CLS)
def test_returns_fallback_message_when_the_call_fails(mock_anthropic_cls):
    mock_client = MagicMock()
    mock_client.messages.create.side_effect = TimeoutError("connection timed out")
    mock_anthropic_cls.return_value = mock_client

    reply = generate_opponent_reply("system prompt text", _payload())

    assert reply == FALLBACK_MESSAGE


@patch(ANTHROPIC_CLS)
def test_generate_scorecard_response_returns_the_parsed_scorecard_as_json(
    mock_anthropic_cls,
):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.parsed_output = _scorecard()
    mock_client.messages.parse.return_value = mock_response
    mock_anthropic_cls.return_value = mock_client

    result = generate_scorecard_response(_payload())

    assert ScorecardSchema.model_validate_json(result) == _scorecard()


@patch(ANTHROPIC_CLS)
def test_generate_scorecard_response_uses_the_judge_system_prompt_and_schema(
    mock_anthropic_cls,
):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.parsed_output = _scorecard()
    mock_client.messages.parse.return_value = mock_response
    mock_anthropic_cls.return_value = mock_client

    generate_scorecard_response(_payload())

    _, kwargs = mock_client.messages.parse.call_args
    assert kwargs["system"] == JUDGE_SYSTEM_PROMPT
    assert kwargs["output_format"] is ScorecardSchema
    assert kwargs["model"] == "claude-haiku-4-5"


@patch(ANTHROPIC_CLS)
def test_generate_scorecard_response_includes_context_in_the_user_message(
    mock_anthropic_cls,
):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.parsed_output = _scorecard()
    mock_client.messages.parse.return_value = mock_response
    mock_anthropic_cls.return_value = mock_client
    payload = _payload()

    generate_scorecard_response(payload)

    _, kwargs = mock_client.messages.parse.call_args
    messages = kwargs["messages"]
    assert payload.rolling_summary in messages[0]["content"]
    assert payload.latest_statement in messages[0]["content"]


@patch(ANTHROPIC_CLS)
def test_generate_scorecard_response_is_constructed_with_the_configured_timeout(
    mock_anthropic_cls,
):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.parsed_output = _scorecard()
    mock_client.messages.parse.return_value = mock_response
    mock_anthropic_cls.return_value = mock_client

    generate_scorecard_response(_payload())

    _, kwargs = mock_anthropic_cls.call_args
    assert kwargs["timeout"] == 8


@patch(ANTHROPIC_CLS)
def test_generate_scorecard_response_propagates_errors_instead_of_falling_back(
    mock_anthropic_cls,
):
    mock_client = MagicMock()
    mock_client.messages.parse.side_effect = TimeoutError("connection timed out")
    mock_anthropic_cls.return_value = mock_client

    with pytest.raises(TimeoutError):
        generate_scorecard_response(_payload())
