from rest_framework import serializers

from .models import Match


class MatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ["id", "topic", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]

    def validate_topic(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Topic must not be empty.")
        if len(value) >= 100:
            raise serializers.ValidationError("Topic must be under 100 characters.")
        return value
