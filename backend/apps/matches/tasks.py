from celery import shared_task
from django.db import transaction

from apps.evaluations.ai.client import generate_opponent_reply
from apps.evaluations.ai.context import build_context_payload
from apps.evaluations.ai.prompts import build_system_prompt
from apps.matches.models import Match, MatchStatus, Message, SenderType


@shared_task
def generate_ai_turn_task(match_id, round_id):
    match = Match.objects.get(id=match_id)
    system_prompt = build_system_prompt(match.topic, match.ai_stance)
    context_payload = build_context_payload(match)
    reply = generate_opponent_reply(system_prompt, context_payload)

    with transaction.atomic():
        Message.objects.create(
            round_id=round_id, match=match, sender=SenderType.AI, content=reply
        )
        match.status = MatchStatus.USER_TURN
        match.save(update_fields=["status", "updated_at"])
