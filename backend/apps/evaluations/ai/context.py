from dataclasses import dataclass

from apps.matches.models import SenderType

MAX_SNIPPET_WORDS = 40
MAX_SUMMARIZED_ROUNDS = 5


@dataclass
class ContextPayload:
    topic: str
    ai_stance: str
    rolling_summary: str
    latest_statement: str


def build_context_payload(match) -> ContextPayload:
    latest_user_message = (
        match.messages.filter(sender=SenderType.USER).order_by("-created_at").first()
    )
    latest_statement = latest_user_message.content if latest_user_message else ""
    excluded_round_id = latest_user_message.round_id if latest_user_message else None

    old_rounds = [
        round_obj for round_obj in match.rounds.all() if round_obj.id != excluded_round_id
    ]
    old_rounds = old_rounds[-MAX_SUMMARIZED_ROUNDS:]

    rolling_summary = " ".join(_summarize_round(round_obj) for round_obj in old_rounds)

    return ContextPayload(
        topic=match.topic,
        ai_stance=match.ai_stance,
        rolling_summary=rolling_summary,
        latest_statement=latest_statement,
    )


def _summarize_round(round_obj) -> str:
    messages_by_sender = {message.sender: message for message in round_obj.messages.all()}
    parts = [f"Round {round_obj.round_number}"]

    user_message = messages_by_sender.get(SenderType.USER)
    if user_message:
        parts.append(f'User argued: "{_truncate(user_message.content)}"')

    ai_message = messages_by_sender.get(SenderType.AI)
    if ai_message:
        parts.append(f'AI argued: "{_truncate(ai_message.content)}"')

    return " — ".join(parts) + "."


def _truncate(content: str) -> str:
    words = content.split()
    if len(words) <= MAX_SNIPPET_WORDS:
        return content
    return " ".join(words[:MAX_SNIPPET_WORDS]) + "..."
