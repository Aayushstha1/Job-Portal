from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import EmployerProfile, JobSeekerProfile, UserRole
from apps.applications.models import Application, ApplicationTimeline
from apps.applications.serializers import ApplicationSerializer
from apps.jobs.matching import build_skill_gap_summary, calculate_job_match
from apps.jobs.models import JobAlert, JobPosting, JobView, SavedJob
from apps.jobs.serializers import JobAlertSerializer, JobPostingDetailSerializer, JobPostingListSerializer, JobPostingWriteSerializer
from apps.notifications.services import create_notification
from common.permissions import IsEmployer, IsJobSeeker, IsPlatformAdmin


class JobViewSet(viewsets.ModelViewSet):
    queryset = (
        JobPosting.objects.select_related("employer__user", "approved_by")
        .prefetch_related("requirements__skill", "requirements__skill__resources")
        .all()
    )

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return JobPostingWriteSerializer
        if self.action == "retrieve":
            return JobPostingDetailSerializer
        return JobPostingListSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsEmployer()]
        if self.action in ("approve",):
            return [permissions.IsAuthenticated(), IsPlatformAdmin()]
        if self.action in ("apply", "save", "saved"):
            return [permissions.IsAuthenticated(), IsJobSeeker()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        if not (user and user.is_authenticated):
            queryset = queryset.filter(status=JobPosting.Status.APPROVED, expires_at__gte=timezone.localdate())
        elif user.role == UserRole.EMPLOYER:
            if self.request.query_params.get("scope") == "mine" or self.action in ("update", "partial_update", "destroy"):
                queryset = queryset.filter(employer__user=user)
            else:
                queryset = queryset.filter(
                    Q(employer__user=user)
                    | Q(status=JobPosting.Status.APPROVED, expires_at__gte=timezone.localdate())
                ).distinct()
        elif not (user.role == UserRole.ADMIN or user.is_staff):
            queryset = queryset.filter(status=JobPosting.Status.APPROVED, expires_at__gte=timezone.localdate())

        query = self.request.query_params
        if title := query.get("title"):
            queryset = queryset.filter(title__icontains=title)
        if location := query.get("location"):
            queryset = queryset.filter(location__icontains=location)
        if industry := query.get("industry"):
            queryset = queryset.filter(industry__icontains=industry)
        if job_type := query.get("job_type"):
            queryset = queryset.filter(job_type=job_type)
        if work_mode := query.get("work_mode"):
            queryset = queryset.filter(work_mode=work_mode)
        if min_salary := query.get("min_salary"):
            queryset = queryset.filter(Q(salary_max__gte=min_salary) | Q(salary_min__gte=min_salary))
        if max_salary := query.get("max_salary"):
            queryset = queryset.filter(Q(salary_min__lte=max_salary) | Q(salary_max__lte=max_salary))
        return queryset

    def perform_create(self, serializer):
        employer_profile, _ = EmployerProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"company_name": self.request.user.full_name or self.request.user.email},
        )
        serializer.save(employer=employer_profile, status=JobPosting.Status.PENDING)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_serializer(instance).data
        if instance.status == JobPosting.Status.APPROVED:
            instance.views_count += 1
            instance.save(update_fields=["views_count", "updated_at"])
            viewer = None
            viewer_city = ""
            if request.user.is_authenticated and request.user.role == UserRole.JOB_SEEKER:
                viewer = getattr(request.user, "job_seeker_profile", None)
                viewer_city = viewer.city if viewer else ""
            JobView.objects.create(job=instance, seeker=viewer, viewer_city=viewer_city)
        return Response(data)

    @action(detail=True, methods=["post"])
    def save(self, request, pk=None):
        job = self.get_object()
        profile, _ = JobSeekerProfile.objects.get_or_create(user=request.user)
        saved_job, created = SavedJob.objects.get_or_create(seeker=profile, job=job)
        if not created:
            saved_job.delete()
            return Response({"saved": False})
        return Response({"saved": True}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def saved(self, request):
        profile, _ = JobSeekerProfile.objects.get_or_create(user=request.user)
        jobs = self.get_queryset().filter(saved_by__seeker=profile)
        serializer = JobPostingListSerializer(jobs, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def apply(self, request, pk=None):
        job = self.get_object()
        if job.status != JobPosting.Status.APPROVED:
            return Response({"detail": "Only approved jobs can receive applications."}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = JobSeekerProfile.objects.get_or_create(user=request.user)
        if Application.objects.filter(job=job, seeker=profile).exists():
            return Response({"detail": "You have already applied for this job."}, status=status.HTTP_400_BAD_REQUEST)

        match_score = calculate_job_match(profile, job)
        gaps = build_skill_gap_summary(profile, job)
        application = Application.objects.create(
            job=job,
            seeker=profile,
            cover_letter=request.data.get("cover_letter", ""),
            match_score=match_score,
            skill_gap_summary=gaps,
        )
        ApplicationTimeline.objects.create(
            application=application,
            from_status="",
            to_status=Application.Status.APPLIED,
            changed_by=request.user,
            note="Application submitted through the portal.",
        )
        job.applications_count += 1
        job.save(update_fields=["applications_count", "updated_at"])
        create_notification(
            recipient=job.employer.user,
            notification_type="new_application",
            title="New application received",
            message=f"{profile.full_name or profile.user.email} applied for {job.title}.",
            payload={"application_id": application.id, "job_id": job.id},
        )
        create_notification(
            recipient=request.user,
            notification_type="application_update",
            title="Application submitted",
            message=f"Your application for {job.title} has been submitted.",
            payload={"application_id": application.id, "job_id": job.id},
        )
        serializer = ApplicationSerializer(application, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        job = self.get_object()
        target_status = request.data.get("status", JobPosting.Status.APPROVED)
        if target_status == JobPosting.Status.APPROVED:
            job.mark_approved(request.user)
        elif target_status == JobPosting.Status.REJECTED:
            job.status = JobPosting.Status.REJECTED
            job.approved_by = request.user
            job.approved_at = timezone.now()
        elif target_status == JobPosting.Status.CLOSED:
            job.status = JobPosting.Status.CLOSED
        else:
            return Response({"detail": "Unsupported moderation status."}, status=status.HTTP_400_BAD_REQUEST)

        job.save()
        create_notification(
            recipient=job.employer.user,
            notification_type="job_status",
            title="Job status updated",
            message=f"{job.title} is now marked as {job.get_status_display().lower()}.",
            payload={"job_id": job.id, "status": job.status},
        )
        serializer = JobPostingDetailSerializer(job, context={"request": request})
        return Response(serializer.data)


class JobAlertViewSet(viewsets.ModelViewSet):
    serializer_class = JobAlertSerializer
    permission_classes = [permissions.IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        profile, _ = JobSeekerProfile.objects.get_or_create(user=self.request.user)
        return JobAlert.objects.filter(seeker=profile)

    def perform_create(self, serializer):
        profile, _ = JobSeekerProfile.objects.get_or_create(user=self.request.user)
        serializer.save(seeker=profile)
