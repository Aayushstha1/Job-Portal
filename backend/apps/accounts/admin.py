from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.accounts.models import EmployerProfile, JobSeekerProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("-date_joined",)
    list_display = ("email", "role", "is_staff", "is_active", "date_joined")
    search_fields = ("email", "first_name", "last_name")
    list_filter = ("role", "is_staff", "is_active")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal", {"fields": ("first_name", "last_name", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "role", "is_staff", "is_active"),
            },
        ),
    )
    filter_horizontal = ("groups", "user_permissions")
    readonly_fields = ("date_joined", "last_login")


@admin.register(JobSeekerProfile)
class JobSeekerProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "city", "experience_years", "updated_at")
    search_fields = ("full_name", "user__email", "city")


@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ("company_name", "user", "industry", "location", "is_verified")
    search_fields = ("company_name", "user__email", "industry")
    list_filter = ("is_verified", "industry")

# Register your models here.
