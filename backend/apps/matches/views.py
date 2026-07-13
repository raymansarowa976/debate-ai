from rest_framework import generics

from .serializers import MatchCreateSerializer


class MatchCreateView(generics.CreateAPIView):
    serializer_class = MatchCreateSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
