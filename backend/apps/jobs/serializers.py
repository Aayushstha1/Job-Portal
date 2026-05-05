from rest_framework import serializers

from apps.jobs.matching import build_skill_gap_summary, calculate_job_match
from apps.jobs.models import JobAlert, JobPosting, JobSkillRequirement
from apps.skills.models import Skill
from apps.skills.serializers import SkillSerializer


class JobSkillRequirementSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.filter(is_active=True),
        source="skill",
        write_only=True,
    )

    class Meta:
        model = JobSkillRequirement
        fields = ("id", "skill", "skill_id", "importance", "minimum_proficiency", "weight")


class JobPostingListSerializer(serializers.ModelSerializer):
    employer_name = serializers.CharField(source="employer.company_name", read_only=True)
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = (
            "id",
            "title",
            "slug",
            "employer_name",
            "location",
            "industry",
            "salary_min",
            "salary_max",
            "job_type",
            "work_mode",
            "status",
            "blind_hiring",
            "expires_at",
            "views_count",
            "applications_count",
            "match_score",
        )

    def get_match_score(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        if request.user.role != "job_seeker" or not hasattr(request.user, "job_seeker_profile"):
            return None
        return calculate_job_match(request.user.job_seeker_profile, obj)


class JobPostingDetailSerializer(JobPostingListSerializer):
    description = serializers.CharField()
    responsibilities = serializers.CharField()
    requirements = JobSkillRequirementSerializer(many=True, read_only=True)
    skill_gap = serializers.SerializerMethodField()
    employer = serializers.SerializerMethodField()

    class Meta(JobPostingListSerializer.Meta):
        fields = JobPostingListSerializer.Meta.fields + (
            "description",
            "responsibilities",
            "requirements",
            "skill_gap",
            "employer",
            "published_at",
            "created_at",
            "updated_at",
        )

    def get_skill_gap(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return []
        if request.user.role != "job_seeker" or not hasattr(request.user, "job_seeker_profile"):
            return []
        return build_skill_gap_summary(request.user.job_seeker_profile, obj)

    def get_employer(self, obj):
        return {
            "company_name": obj.employer.company_name,
            "industry": obj.employer.industry,
            "location": obj.employer.location,
            "website": obj.employer.website,
        }


class JobPostingWriteSerializer(serializers.ModelSerializer):
    requirements = JobSkillRequirementSerializer(many=True)

    class Meta:
        model = JobPosting
        fields = (
            "id",
            "title",
            "description",
            "responsibilities",
            "location",
            "industry",
            "salary_min",
            "salary_max",
            "job_type",
            "work_mode",
            "expires_at",
            "blind_hiring",
            "requirements",
        )

    def validate(self, attrs):
        salary_min = attrs.get("salary_min")
        salary_max = attrs.get("salary_max")
        if salary_min and salary_max and salary_min > salary_max:
            raise serializers.ValidationError("Minimum salary cannot exceed maximum salary.")
        return attrs

    def create(self, validated_data):
        requirements = validated_data.pop("requirements", [])
        job = JobPosting.objects.create(**validated_data)
        for requirement in requirements:
            JobSkillRequirement.objects.create(job=job, **requirement)
        return job

    def update(self, instance, validated_data):
        requirements = validated_data.pop("requirements", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.status = JobPosting.Status.PENDING
        instance.save()
        if requirements is not None:
            instance.requirements.all().delete()
            for requirement in requirements:
                JobSkillRequirement.objects.create(job=instance, **requirement)
        return instance


class JobAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobAlert
        fields = (
            "id",
            "keywords",
            "location",
            "salary_min",
            "salary_max",
            "job_type",
            "industry",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")
