from django.urls import path

from .views import MatchCreateView

urlpatterns = [
    path("", MatchCreateView.as_view(), name="match-create"),
]
