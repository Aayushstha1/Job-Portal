from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "applied", "Applied"
        SHORTLISTED = "shortlisted", "Shortlisted"
        INTERVIEW_SCHEDULED = "interview_scheduled", "Interview Scheduled"
        HIRED = "hired", "Hired"
        REJECTED = "rejected", "Rejected"

    job = models.ForeignKey("jobs.JobPosting", on_delete=models.CASCADE, related_name="applications")
    seeker = models.ForeignKey(
        "accounts.JobSeekerProfile",
        on_delete=models.CASCADE,
        related_name="applications",
    )
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.APPLIED)
    match_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    skill_gap_summary = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("job", "seeker")

    def __str__(self):
        return f"{self.seeker} -> {self.job.title}"


class Interview(models.Model):
    class Mode(models.TextChoices):
        VIDEO = "video", "Video"
        PHONE = "phone", "Phone"
        ON_SITE = "on_site", "On Site"

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="interviews")
    scheduled_at = models.DateTimeField()
    mode = models.CharField(max_length=20, choices=Mode.choices, default=Mode.VIDEO)
    meeting_link = models.URLField(blank=True)
    venue = models.CharField(max_length=255, blank=True)
    employer_notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="scheduled_interviews",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["scheduled_at"]


class ApplicationTimeline(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="timeline")
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="application_timeline_events",
    )
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

# Create your models here.
