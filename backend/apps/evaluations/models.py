from django.db import models

from apps.matches.models import Match


class WinnerChoice(models.TextChoices):
    USER = "USER", "User"
    AI = "AI", "AI"
    DRAW = "DRAW", "Draw"


class Scorecard(models.Model):
    match = models.OneToOneField(
        Match, on_delete=models.CASCADE, related_name="scorecard"
    )
    logic_score = models.FloatField(null=True, blank=True)
    evidence_score = models.FloatField(null=True, blank=True)
    rhetoric_score = models.FloatField(null=True, blank=True)
    adherence_score = models.FloatField(null=True, blank=True)
    fallacies = models.JSONField(default=list, blank=True)
    winner = models.CharField(
        max_length=10, choices=WinnerChoice.choices, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Scorecard for {self.match_id}"
