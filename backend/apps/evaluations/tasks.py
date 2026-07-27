import logging

from celery import shared_task
from django.db import transaction
from pydantic import ValidationError

from apps.evaluations.ai.client import generate_scorecard_response
from apps.evaluations.ai.context import build_context_payload
from apps.evaluations.ai.schemas import ScorecardSchema
from apps.evaluations.models import Scorecard
from apps.matches.models import Match, MatchStatus

logger = logging.getLogger(__name__)


class ScorecardValidationError(Exception):
    """Raised when the judge's raw response fails schema validation."""


@shared_task(
    bind=True,
    autoretry_for=(ScorecardValidationError,),
    retry_backoff=True,
    retry_backoff_max=60,
    max_retries=3,
)
def evaluate_match_task(self, match_id):
    match = Match.objects.get(id=match_id)
    context_payload = build_context_payload(match)
    raw_response = generate_scorecard_response(context_payload)

    try:
        scorecard_data = ScorecardSchema.model_validate_json(raw_response)
    except ValidationError as exc:
        logger.warning(
            "Judge response failed schema validation (attempt %s).",
            self.request.retries + 1,
            exc_info=True,
        )
        raise ScorecardValidationError(str(exc)) from exc

    with transaction.atomic():
        Scorecard.objects.update_or_create(
            match=match,
            defaults={
                "logic_score": scorecard_data.logic,
                "evidence_score": scorecard_data.evidence,
                "rhetoric_score": scorecard_data.rhetoric,
                "adherence_score": scorecard_data.adherence,
                "fallacies": [
                    fallacy.model_dump()
                    for fallacy in scorecard_data.fallacies_detected
                ],
            },
        )
        match.status = MatchStatus.COMPLETED
        match.save(update_fields=["status", "updated_at"])
