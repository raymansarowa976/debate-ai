from rest_framework import serializers

from .models import Match, Message, Round


class MatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ["id", "topic", "user_stance", "status", "created_at"]
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
    ai_stance = serializers.CharField(read_only=True)

    class Meta:
        model = Match
        fields = [
            "id",
            "topic",
            "user_stance",
            "ai_stance",
            "status",
            "created_at",
            "updated_at",
            "rounds",
        ]


class MatchShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ["share_slug"]
        read_only_fields = ["share_slug"]


class PublicMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["sender", "content", "created_at"]


class PublicRoundSerializer(serializers.ModelSerializer):
    messages = PublicMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Round
        fields = ["round_number", "messages"]


class PublicMatchDetailSerializer(serializers.ModelSerializer):
    """Sanitized view for unauthenticated public access.

    Deliberately excludes the owning user, the match's internal (UUID)
    id, and any auto-incrementing round/message ids so a shared link
    cannot be used to identify or enumerate accounts or records.
    """

    rounds = PublicRoundSerializer(many=True, read_only=True)
    ai_stance = serializers.CharField(read_only=True)

    class Meta:
        model = Match
        fields = [
            "share_slug",
            "topic",
            "user_stance",
            "ai_stance",
            "status",
            "created_at",
            "rounds",
        ]
