from rest_framework.permissions import BasePermission

from apps.accounts.models import UserRole


class IsJobSeeker(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.JOB_SEEKER)


class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.EMPLOYER)


class IsPlatformAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == UserRole.ADMIN or request.user.is_staff)
        )
