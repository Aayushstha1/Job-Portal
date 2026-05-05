from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class JobPosting(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = "full_time", "Full Time"
        PART_TIME = "part_time", "Part Time"
        CONTRACT = "contract", "Contract"
        INTERNSHIP = "internship", "Internship"

    class WorkMode(models.TextChoices):
        REMOTE = "remote", "Remote"
        HYBRID = "hybrid", "Hybrid"
        ON_SITE = "on_site", "On Site"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending Approval"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CLOSED = "closed", "Closed"
        EXPIRED = "expired", "Expired"

    employer = models.ForeignKey(
        "accounts.EmployerProfile",
        on_delete=models.CASCADE,
        related_name="jobs",
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField()
    responsibilities = models.TextField(blank=True)
    location = models.CharField(max_length=120)
    industry = models.CharField(max_length=120, blank=True)
    salary_min = models.PositiveIntegerField(blank=True, null=True)
    salary_max = models.PositiveIntegerField(blank=True, null=True)
    work_mode = models.CharField(max_length=20, choices=WorkMode.choices, default=WorkMode.ON_SITE)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    expires_at = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    blind_hiring = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    applications_count = models.PositiveIntegerField(default=0)
    boosted_until = models.DateTimeField(blank=True, null=True)
    published_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="approved_jobs",
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)[:240] or "job"
            slug = base_slug
            counter = 1
            while JobPosting.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def mark_approved(self, approved_by):
        self.status = self.Status.APPROVED
        self.published_at = timezone.now()
        self.approved_by = approved_by
        self.approved_at = timezone.now()


class JobSkillRequirement(models.Model):
    class Importance(models.TextChoices):
        REQUIRED = "required", "Required"
        NICE_TO_HAVE = "nice_to_have", "Nice To Have"

    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name="requirements")
    skill = models.ForeignKey("skills.Skill", on_delete=models.CASCADE, related_name="job_requirements")
    importance = models.CharField(max_length=20, choices=Importance.choices, default=Importance.REQUIRED)
    minimum_proficiency = models.PositiveSmallIntegerField(default=3)
    weight = models.FloatField(default=1.0)

    class Meta:
        ordering = ["-importance", "-minimum_proficiency", "skill__name"]
        unique_together = ("job", "skill")

    def __str__(self):
        return f"{self.job.title}: {self.skill.name}"


class SavedJob(models.Model):
    seeker = models.ForeignKey(
        "accounts.JobSeekerProfile",
        on_delete=models.CASCADE,
        related_name="saved_jobs",
    )
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("seeker", "job")


class JobAlert(models.Model):
    seeker = models.ForeignKey(
        "accounts.JobSeekerProfile",
        on_delete=models.CASCADE,
        related_name="job_alerts",
    )
    keywords = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=120, blank=True)
    salary_min = models.PositiveIntegerField(blank=True, null=True)
    salary_max = models.PositiveIntegerField(blank=True, null=True)
    job_type = models.CharField(max_length=20, choices=JobPosting.JobType.choices, blank=True)
    industry = models.CharField(max_length=120, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]


class JobView(models.Model):
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name="views")
    seeker = models.ForeignKey(
        "accounts.JobSeekerProfile",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="job_views",
    )
    viewer_city = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

# Create your models here.
