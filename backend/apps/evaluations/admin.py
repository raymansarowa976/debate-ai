from django.contrib import admin

from .models import Scorecard


@admin.register(Scorecard)
class ScorecardAdmin(admin.ModelAdmin):
    list_display = ["id", "match", "winner", "created_at"]
    list_filter = ["winner"]
