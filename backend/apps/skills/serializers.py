from rest_framework import serializers

from apps.skills.models import SeekerSkill, Skill, SkillResource


class SkillResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillResource
        fields = ("id", "title", "url", "provider")


class SkillSerializer(serializers.ModelSerializer):
    resources = SkillResourceSerializer(many=True, read_only=True)

    class Meta:
        model = Skill
        fields = (
            "id",
            "name",
            "slug",
            "category",
            "description",
            "is_active",
            "resources",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("slug", "created_at", "updated_at")


class SeekerSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.filter(is_active=True),
        source="skill",
        write_only=True,
    )

    class Meta:
        model = SeekerSkill
        fields = (
            "id",
            "skill",
            "skill_id",
            "proficiency",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")
