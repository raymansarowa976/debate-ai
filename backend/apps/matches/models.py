import uuid

from django.conf import settings
from django.db import models


class MatchStatus(models.TextChoices):
    INITIALIZED = "INITIALIZED", "Initialized"
    USER_TURN = "USER_TURN", "User Turn"
    AI_TURN = "AI_TURN", "AI Turn"
    EVALUATING = "EVALUATING", "Evaluating"
    COMPLETED = "COMPLETED", "Completed"


OPEN_FOR_USER_TURN_STATUSES = {MatchStatus.INITIALIZED, MatchStatus.USER_TURN}


class SenderType(models.TextChoices):
    USER = "USER", "User"
    AI = "AI", "AI"


class Stance(models.TextChoices):
    FOR = "FOR", "For"
    AGAINST = "AGAINST", "Against"


class Match(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="matches"
    )
    topic = models.CharField(max_length=100)
    user_stance = models.CharField(max_length=10, choices=Stance.choices)
    status = models.CharField(
        max_length=20, choices=MatchStatus.choices, default=MatchStatus.INITIALIZED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Public sharing: matches are private by default. A match only becomes
    # publicly viewable once the owner explicitly shares it, at which point
    # it gets a random, non-enumerable slug decoupled from its internal id.
    is_public = models.BooleanField(default=False)
    share_slug = models.CharField(max_length=11, unique=True, null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "status"])]

    def __str__(self):
        return f"{self.topic} ({self.status})"

    @property
    def ai_stance(self) -> str:
        return Stance.AGAINST if self.user_stance == Stance.FOR else Stance.FOR


class Round(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="rounds")
    round_number = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["round_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["match", "round_number"], name="unique_round_number_per_match"
            )
        ]
        indexes = [models.Index(fields=["match", "round_number"])]

    def __str__(self):
        return f"Round {self.round_number} of {self.match_id}"


class Message(models.Model):
    round = models.ForeignKey(Round, on_delete=models.CASCADE, related_name="messages")
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=SenderType.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["match", "created_at"])]

    def __str__(self):
        return f"{self.sender} message in {self.match_id}"
