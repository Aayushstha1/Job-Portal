from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.accounts.models import UserRole
from apps.applications.models import Application, ApplicationTimeline, Interview
from apps.applications.serializers import (
    ApplicationSerializer,
    ApplicationStatusUpdateSerializer,
    InterviewSerializer,
)
from apps.jobs.models import JobPosting
from apps.notifications.services import create_notification


class ApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = (
        Application.objects.select_related("job", "job__employer__user", "seeker", "seeker__user")
        .prefetch_related("interviews", "timeline")
        .all()
    )

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        if user.role == UserRole.JOB_SEEKER:
            queryset = queryset.filter(seeker__user=user)
        elif user.role == UserRole.EMPLOYER:
            queryset = queryset.filter(job__employer__user=user)
        if status_value := self.request.query_params.get("status"):
            queryset = queryset.filter(status=status_value)
        if job_id := self.request.query_params.get("job"):
            queryset = queryset.filter(job_id=job_id)
        return queryset.order_by("-match_score", "-created_at")

    def _ensure_employer_scope(self, application):
        user = self.request.user
        if user.role == UserRole.ADMIN or user.is_staff:
            return
        if user.role != UserRole.EMPLOYER or application.job.employer.user_id != user.id:
            raise PermissionDenied("You do not have permission to modify this application.")

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        application = self.get_object()
        self._ensure_employer_scope(application)
        serializer = ApplicationStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        previous_status = application.status
        application.status = serializer.validated_data["status"]
        application.save(update_fields=["status", "updated_at"])
        ApplicationTimeline.objects.create(
            application=application,
            from_status=previous_status,
            to_status=application.status,
            changed_by=request.user,
            note=serializer.validated_data.get("note", ""),
        )
        if application.status == Application.Status.HIRED:
            application.job.status = JobPosting.Status.CLOSED
            application.job.save(update_fields=["status", "updated_at"])

        create_notification(
            recipient=application.seeker.user,
            notification_type="application_update",
            title="Application status updated",
            message=f"Your application for {application.job.title} is now {application.get_status_display().lower()}.",
            payload={"application_id": application.id, "status": application.status},
        )
        return Response(ApplicationSerializer(application, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def schedule_interview(self, request, pk=None):
        application = self.get_object()
        self._ensure_employer_scope(application)
        serializer = InterviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        interview = serializer.save(application=application, created_by=request.user)

        previous_status = application.status
        application.status = Application.Status.INTERVIEW_SCHEDULED
        application.save(update_fields=["status", "updated_at"])
        ApplicationTimeline.objects.create(
            application=application,
            from_status=previous_status,
            to_status=application.status,
            changed_by=request.user,
            note="Interview scheduled.",
        )
        create_notification(
            recipient=application.seeker.user,
            notification_type="interview_scheduled",
            title="Interview scheduled",
            message=f"An interview has been scheduled for {application.job.title}.",
            payload={"application_id": application.id, "interview_id": interview.id},
        )
        return Response(
            ApplicationSerializer(application, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

# Create your views here.
