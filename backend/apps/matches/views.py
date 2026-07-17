from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response

from apps.evaluations.tasks import evaluate_match_task

from .models import OPEN_FOR_USER_TURN_STATUSES, Match, MatchStatus, Round, SenderType
from .serializers import (
    MatchCreateSerializer,
    MatchDetailSerializer,
    MessageCreateSerializer,
)


class MatchCreateView(generics.CreateAPIView):
    serializer_class = MatchCreateSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MatchDetailView(generics.RetrieveAPIView):
    serializer_class = MatchDetailSerializer
    lookup_url_kwarg = "match_id"

    def get_queryset(self):
        return Match.objects.filter(user=self.request.user).prefetch_related(
            "rounds__messages"
        )


class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageCreateSerializer

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            match = get_object_or_404(
                Match.objects.select_for_update(),
                id=self.kwargs["match_id"],
                user=request.user,
            )
            if match.status not in OPEN_FOR_USER_TURN_STATUSES:
                return Response(
                    {"detail": "It is not your turn. Wait for the AI's response."},
                    status=status.HTTP_409_CONFLICT,
                )
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            round_obj = Round.objects.create(
                match=match, round_number=match.rounds.count() + 1
            )
            serializer.save(round=round_obj, match=match, sender=SenderType.USER)
            match.status = MatchStatus.AI_TURN
            match.save(update_fields=["status", "updated_at"])
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EvaluationSubmissionView(generics.CreateAPIView):
    serializer_class = MessageCreateSerializer

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            match = get_object_or_404(
                Match.objects.select_for_update(),
                id=self.kwargs["match_id"],
                user=request.user,
            )
            if match.status not in OPEN_FOR_USER_TURN_STATUSES:
                return Response(
                    {"detail": "It is not your turn. Wait for the AI's response."},
                    status=status.HTTP_409_CONFLICT,
                )
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            round_obj = Round.objects.create(
                match=match, round_number=match.rounds.count() + 1
            )
            serializer.save(round=round_obj, match=match, sender=SenderType.USER)
            match.status = MatchStatus.EVALUATING
            match.save(update_fields=["status", "updated_at"])
        evaluate_match_task.delay(str(match.id))
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
