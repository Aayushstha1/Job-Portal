from django.contrib import admin

from apps.jobs.models import JobAlert, JobPosting, JobSkillRequirement, JobView, SavedJob


class JobSkillRequirementInline(admin.TabularInline):
    model = JobSkillRequirement
    extra = 1


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ("title", "employer", "job_type", "work_mode", "status", "applications_count", "expires_at")
    search_fields = ("title", "employer__company_name", "location", "industry")
    list_filter = ("status", "job_type", "work_mode", "blind_hiring")
    inlines = [JobSkillRequirementInline]


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ("job", "seeker", "created_at")
    search_fields = ("job__title", "seeker__full_name", "seeker__user__email")


@admin.register(JobAlert)
class JobAlertAdmin(admin.ModelAdmin):
    list_display = ("seeker", "keywords", "location", "job_type", "is_active")
    search_fields = ("seeker__full_name", "keywords", "location")
    list_filter = ("is_active", "job_type")


@admin.register(JobView)
class JobViewAdmin(admin.ModelAdmin):
    list_display = ("job", "seeker", "viewer_city", "created_at")
    search_fields = ("job__title", "viewer_city")

# Register your models here.
