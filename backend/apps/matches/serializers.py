from rest_framework import serializers

from .models import Match, Message, Round


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


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "sender", "content", "created_at"]
        read_only_fields = ["id", "sender", "created_at"]

    def validate_content(self, value):
        stripped = value.strip()
        word_count = len(stripped.split())
        if word_count < 50:
            raise serializers.ValidationError(
                f"Argument must be at least 50 words (got {word_count})."
            )
        if word_count > 500:
            raise serializers.ValidationError(
                f"Argument must be at most 500 words (got {word_count})."
            )
        return stripped


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "sender", "content", "created_at"]


class RoundSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Round
        fields = ["id", "round_number", "messages"]


class MatchDetailSerializer(serializers.ModelSerializer):
    rounds = RoundSerializer(many=True, read_only=True)

    class Meta:
        model = Match
        fields = ["id", "topic", "status", "created_at", "updated_at", "rounds"]
