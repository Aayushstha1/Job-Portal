from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class Skill(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    category = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SkillResource(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="resources")
    title = models.CharField(max_length=255)
    url = models.URLField()
    provider = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.skill.name}: {self.title}"


class SeekerSkill(models.Model):
    seeker = models.ForeignKey(
        "accounts.JobSeekerProfile",
        on_delete=models.CASCADE,
        related_name="skills",
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="seeker_skills")
    proficiency = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-proficiency", "skill__name"]
        unique_together = ("seeker", "skill")

    def __str__(self):
        return f"{self.seeker} - {self.skill.name} ({self.proficiency})"

# Create your models here.
