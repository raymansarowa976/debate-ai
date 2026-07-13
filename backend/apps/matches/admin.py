from django.contrib import admin

from .models import Match, Message, Round


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ["id", "topic", "status", "user", "created_at"]
    list_filter = ["status"]


@admin.register(Round)
class RoundAdmin(admin.ModelAdmin):
    list_display = ["id", "match", "round_number"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "match", "round", "sender", "created_at"]
    list_filter = ["sender"]
