import logging

from django.conf import settings
from openai import OpenAI

from apps.evaluations.ai.context import ContextPayload
from apps.evaluations.ai.prompts import JUDGE_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

FALLBACK_MESSAGE = (
    "The opponent could not be reached in time. Please continue to the next round."
)


def generate_opponent_reply(system_prompt: str, context_payload: ContextPayload) -> str:
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": _compose_user_content(context_payload)},
    ]

    try:
        response = OpenAI(api_key=settings.OPENAI_API_KEY).chat.completions.create(
            model=settings.OPENAI_MODEL,
            timeout=settings.OPENAI_TIMEOUT_SECONDS,
            messages=messages,
        )
    except Exception:
        logger.warning(
            "Opponent LLM call failed; returning fallback message.", exc_info=True
        )
        return FALLBACK_MESSAGE

    return response.choices[0].message.content


def generate_scorecard_response(context_payload: ContextPayload) -> str:
    messages = [
        {"role": "system", "content": JUDGE_SYSTEM_PROMPT},
        {"role": "user", "content": _compose_user_content(context_payload)},
    ]

    response = OpenAI(api_key=settings.OPENAI_API_KEY).chat.completions.create(
        model=settings.OPENAI_MODEL,
        timeout=settings.OPENAI_TIMEOUT_SECONDS,
        messages=messages,
    )

    return response.choices[0].message.content


def _compose_user_content(context_payload: ContextPayload) -> str:
    if context_payload.rolling_summary:
        return (
            f"Summary of earlier rounds: {context_payload.rolling_summary}\n\n"
            f"User's latest argument: {context_payload.latest_statement}"
        )
    return f"User's latest argument: {context_payload.latest_statement}"
