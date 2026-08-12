from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.evaluations.tasks import evaluate_match_task

from .models import OPEN_FOR_USER_TURN_STATUSES, Match, MatchStatus, Round, SenderType
from .serializers import (
    MatchCreateSerializer,
    MatchDetailSerializer,
    MatchShareSerializer,
    MessageCreateSerializer,
    PublicMatchDetailSerializer,
)
from .sharing import generate_share_slug


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


class MatchShareView(APIView):
    def post(self, request, *args, **kwargs):
        match = get_object_or_404(Match, id=self.kwargs["match_id"], user=request.user)
        if not match.share_slug:
            match.share_slug = self._unique_share_slug()
        match.is_public = True
        match.save(update_fields=["share_slug", "is_public", "updated_at"])
        serializer = MatchShareSerializer(match)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @staticmethod
    def _unique_share_slug():
        slug = generate_share_slug()
        while Match.objects.filter(share_slug=slug).exists():
            slug = generate_share_slug()
        return slug


class PublicMatchDetailView(generics.RetrieveAPIView):
    serializer_class = PublicMatchDetailSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    lookup_url_kwarg = "share_slug"
    lookup_field = "share_slug"

    def get_queryset(self):
        return Match.objects.filter(is_public=True).prefetch_related("rounds__messages")


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
