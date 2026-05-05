from django.contrib import admin

from apps.notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient", "type", "title", "is_read", "created_at")
    search_fields = ("recipient__email", "title", "message")
    list_filter = ("type", "is_read")

# Register your models here.
