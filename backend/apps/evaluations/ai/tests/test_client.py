from unittest.mock import MagicMock, patch

from apps.evaluations.ai.client import FALLBACK_MESSAGE, generate_opponent_reply
from apps.evaluations.ai.context import ContextPayload


def _payload():
    return ContextPayload(
        topic="Should AI write laws?",
        ai_stance="AGAINST",
        rolling_summary='Round 1 — User argued: "yes" — AI argued: "no".',
        latest_statement="AI should never write binding law.",
    )


def _mock_response(content):
    response = MagicMock()
    response.choices = [MagicMock(message=MagicMock(content=content))]
    return response


@patch("apps.evaluations.ai.client.OpenAI")
def test_returns_the_model_reply_on_success(mock_openai_cls):
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _mock_response(
        "Nice try, but no."
    )
    mock_openai_cls.return_value = mock_client

    reply = generate_opponent_reply("system prompt text", _payload())

    assert reply == "Nice try, but no."


@patch("apps.evaluations.ai.client.OpenAI")
def test_request_is_sent_with_an_eight_second_timeout(mock_openai_cls):
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _mock_response("reply")
    mock_openai_cls.return_value = mock_client

    generate_opponent_reply("system prompt text", _payload())

    _, kwargs = mock_client.chat.completions.create.call_args
    assert kwargs["timeout"] == 8


@patch("apps.evaluations.ai.client.OpenAI")
def test_request_payload_contains_the_system_prompt_and_context(mock_openai_cls):
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _mock_response("reply")
    mock_openai_cls.return_value = mock_client
    payload = _payload()

    generate_opponent_reply("You must argue AGAINST the topic.", payload)

    _, kwargs = mock_client.chat.completions.create.call_args
    messages = kwargs["messages"]
    assert messages[0] == {
        "role": "system",
        "content": "You must argue AGAINST the topic.",
    }
    assert payload.rolling_summary in messages[1]["content"]
    assert payload.latest_statement in messages[1]["content"]


@patch("apps.evaluations.ai.client.OpenAI")
def test_returns_fallback_message_when_the_call_fails(mock_openai_cls):
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = TimeoutError(
        "connection timed out"
    )
    mock_openai_cls.return_value = mock_client

    reply = generate_opponent_reply("system prompt text", _payload())

    assert reply == FALLBACK_MESSAGE
