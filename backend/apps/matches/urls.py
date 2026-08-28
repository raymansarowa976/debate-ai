from django.urls import path, register_converter

from .sharing import HashSlugConverter
from .views import (
    EvaluationSubmissionView,
    MatchCreateView,
    MatchDetailView,
    MatchShareView,
    MessageCreateView,
    PublicMatchDetailView,
)

register_converter(HashSlugConverter, "hashslug")

urlpatterns = [
    path("", MatchCreateView.as_view(), name="match-create"),
    path(
        "public/<hashslug:share_slug>/",
        PublicMatchDetailView.as_view(),
        name="match-public-detail",
    ),
    path("<uuid:match_id>/", MatchDetailView.as_view(), name="match-detail"),
    path("<uuid:match_id>/share/", MatchShareView.as_view(), name="match-share"),
    path(
        "<uuid:match_id>/messages/", MessageCreateView.as_view(), name="message-create"
    ),
    path(
        "<uuid:match_id>/evaluate/",
        EvaluationSubmissionView.as_view(),
        name="match-evaluate",
    ),
]
