from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import (
    EmployerProfileView,
    LoginView,
    MeView,
    RefreshView,
    RegisterView,
    SeekerProfileView,
)
from apps.applications.views import ApplicationViewSet
from apps.jobs.views import JobAlertViewSet, JobViewSet
from apps.notifications.views import NotificationViewSet
from apps.skills.views import SeekerSkillViewSet, SkillViewSet

router = DefaultRouter()
router.register("skills", SkillViewSet, basename="skill")
router.register("seeker-skills", SeekerSkillViewSet, basename="seeker-skill")
router.register("jobs", JobViewSet, basename="job")
router.register("job-alerts", JobAlertViewSet, basename="job-alert")
router.register("applications", ApplicationViewSet, basename="application")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", RefreshView.as_view(), name="refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/seeker-profile/", SeekerProfileView.as_view(), name="seeker-profile"),
    path("auth/employer-profile/", EmployerProfileView.as_view(), name="employer-profile"),
    path("", include(router.urls)),
]
