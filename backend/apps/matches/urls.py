from django.urls import path

from .views import MatchCreateView, MatchDetailView, MessageCreateView

urlpatterns = [
    path("", MatchCreateView.as_view(), name="match-create"),
    path("<uuid:match_id>/", MatchDetailView.as_view(), name="match-detail"),
    path("<uuid:match_id>/messages/", MessageCreateView.as_view(), name="message-create"),
]
