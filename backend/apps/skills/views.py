from rest_framework import permissions, viewsets

from apps.accounts.models import JobSeekerProfile
from apps.skills.models import SeekerSkill, Skill
from apps.skills.serializers import SeekerSkillSerializer, SkillSerializer
from common.permissions import IsJobSeeker, IsPlatformAdmin


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.prefetch_related("resources").all()
    serializer_class = SkillSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticatedOrReadOnly()]
        return [permissions.IsAuthenticated(), IsPlatformAdmin()]


class SeekerSkillViewSet(viewsets.ModelViewSet):
    serializer_class = SeekerSkillSerializer
    permission_classes = [permissions.IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        profile, _ = JobSeekerProfile.objects.get_or_create(user=self.request.user)
        return SeekerSkill.objects.select_related("skill").filter(seeker=profile)

    def perform_create(self, serializer):
        profile, _ = JobSeekerProfile.objects.get_or_create(user=self.request.user)
        serializer.save(seeker=profile)

# Create your views here.
