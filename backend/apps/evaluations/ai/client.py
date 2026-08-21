import logging

import anthropic
from django.conf import settings

from apps.evaluations.ai.context import ContextPayload
from apps.evaluations.ai.prompts import JUDGE_SYSTEM_PROMPT
from apps.evaluations.ai.schemas import ScorecardSchema

logger = logging.getLogger(__name__)

FALLBACK_MESSAGE = (
    "The opponent could not be reached in time. Please continue to the next round."
)

REPLY_MAX_TOKENS = 1024
SCORECARD_MAX_TOKENS = 1024


def _client() -> anthropic.Anthropic:
    return anthropic.Anthropic(
        api_key=settings.ANTHROPIC_API_KEY, timeout=settings.AI_TIMEOUT_SECONDS
    )


def generate_opponent_reply(system_prompt: str, context_payload: ContextPayload) -> str:
    try:
        response = _client().messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=REPLY_MAX_TOKENS,
            system=system_prompt,
            messages=[
                {"role": "user", "content": _compose_user_content(context_payload)}
            ],
        )
    except Exception:
        logger.warning(
            "Opponent LLM call failed; returning fallback message.", exc_info=True
        )
        return FALLBACK_MESSAGE

    return next(block.text for block in response.content if block.type == "text")


def generate_scorecard_response(context_payload: ContextPayload) -> str:
    response = _client().messages.parse(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=SCORECARD_MAX_TOKENS,
        system=JUDGE_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": _compose_user_content(context_payload)}],
        output_format=ScorecardSchema,
    )

    return response.parsed_output.model_dump_json()


def _compose_user_content(context_payload: ContextPayload) -> str:
    if context_payload.rolling_summary:
        return (
            f"Summary of earlier rounds: {context_payload.rolling_summary}\n\n"
            f"User's latest argument: {context_payload.latest_statement}"
        )
    return f"User's latest argument: {context_payload.latest_statement}"
