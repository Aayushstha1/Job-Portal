from django.contrib import admin

from apps.skills.models import SeekerSkill, Skill, SkillResource


class SkillResourceInline(admin.TabularInline):
    model = SkillResource
    extra = 1


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "is_active", "updated_at")
    search_fields = ("name", "category")
    list_filter = ("category", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [SkillResourceInline]


@admin.register(SeekerSkill)
class SeekerSkillAdmin(admin.ModelAdmin):
    list_display = ("seeker", "skill", "proficiency", "updated_at")
    search_fields = ("seeker__full_name", "seeker__user__email", "skill__name")

# Register your models here.
