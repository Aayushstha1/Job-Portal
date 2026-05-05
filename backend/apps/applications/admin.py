from django.contrib import admin

from apps.applications.models import Application, ApplicationTimeline, Interview


class InterviewInline(admin.TabularInline):
    model = Interview
    extra = 0


class ApplicationTimelineInline(admin.TabularInline):
    model = ApplicationTimeline
    extra = 0


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("job", "seeker", "status", "match_score", "created_at")
    search_fields = ("job__title", "seeker__full_name", "seeker__user__email")
    list_filter = ("status",)
    inlines = [InterviewInline, ApplicationTimelineInline]

# Register your models here.
