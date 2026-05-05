from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import EmployerProfile, JobSeekerProfile
from apps.accounts.serializers import (
    EmployerProfileSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)
from common.jwt import create_token, decode_token
from common.permissions import IsEmployer, IsJobSeeker


def _token_response_for_user(user):
    return {
        "access": create_token(user, token_type="access"),
        "refresh": create_token(user, token_type="refresh"),
        "user": UserSerializer(user).data,
    }


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(_token_response_for_user(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(_token_response_for_user(serializer.validated_data["user"]))


class RefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    class InputSerializer(serializers.Serializer):
        refresh = serializers.CharField()

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = decode_token(serializer.validated_data["refresh"], expected_type="refresh")
        user_model = get_user_model()
        try:
            user = user_model.objects.get(pk=payload["sub"], is_active=True)
        except user_model.DoesNotExist as exc:
            raise serializers.ValidationError({"refresh": "Refresh token is invalid."}) from exc
        return Response(
            {
                "access": create_token(user, token_type="access"),
                "refresh": create_token(user, token_type="refresh"),
            }
        )


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class SeekerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsJobSeeker]

    def get_object(self):
        profile, _ = JobSeekerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get_serializer_class(self):
        from apps.accounts.serializers import JobSeekerProfileSerializer

        return JobSeekerProfileSerializer


class EmployerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = EmployerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def get_object(self):
        profile, _ = EmployerProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"company_name": self.request.user.full_name or self.request.user.email},
        )
        return profile

# Create your views here.
