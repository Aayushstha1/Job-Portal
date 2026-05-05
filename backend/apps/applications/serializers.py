from rest_framework import serializers

from apps.applications.models import Application, ApplicationTimeline, Interview


class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = (
            "id",
            "scheduled_at",
            "mode",
            "meeting_link",
            "venue",
            "employer_notes",
            "created_at",
        )
        read_only_fields = ("created_at",)


class ApplicationTimelineSerializer(serializers.ModelSerializer):
    changed_by_email = serializers.EmailField(source="changed_by.email", read_only=True)

    class Meta:
        model = ApplicationTimeline
        fields = ("id", "from_status", "to_status", "note", "changed_by_email", "created_at")


class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    employer_name = serializers.CharField(source="job.employer.company_name", read_only=True)
    seeker_name = serializers.SerializerMethodField()
    interviews = InterviewSerializer(many=True, read_only=True)
    timeline = ApplicationTimelineSerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = (
            "id",
            "job",
            "job_title",
            "employer_name",
            "seeker",
            "seeker_name",
            "cover_letter",
            "status",
            "match_score",
            "skill_gap_summary",
            "interviews",
            "timeline",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "job_title",
            "employer_name",
            "seeker_name",
            "match_score",
            "skill_gap_summary",
            "created_at",
            "updated_at",
        )

    def get_seeker_name(self, obj):
        return obj.seeker.full_name or obj.seeker.user.email


class ApplicationStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Application.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)
