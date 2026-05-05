from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.models import EmployerProfile, JobSeekerProfile, UserRole

User = get_user_model()


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = JobSeekerProfile
        fields = (
            "id",
            "full_name",
            "city",
            "experience_years",
            "bio",
            "education",
            "desired_title",
            "preferred_location",
            "resume",
            "resume_url",
            "video_intro",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at", "resume_url")

    def get_resume_url(self, obj):
        request = self.context.get("request")
        if not obj.resume:
            return ""
        if request:
            return request.build_absolute_uri(obj.resume.url)
        return obj.resume.url


class EmployerProfileSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = EmployerProfile
        fields = (
            "id",
            "company_name",
            "industry",
            "location",
            "website",
            "logo",
            "logo_url",
            "about",
            "is_verified",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("is_verified", "created_at", "updated_at", "logo_url")

    def get_logo_url(self, obj):
        request = self.context.get("request")
        if not obj.logo:
            return ""
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "full_name",
            "profile",
            "date_joined",
        )
        read_only_fields = ("date_joined", "full_name")

    def get_profile(self, obj):
        context = {"request": self.context.get("request")}
        if obj.role == UserRole.JOB_SEEKER and hasattr(obj, "job_seeker_profile"):
            return JobSeekerProfileSerializer(obj.job_seeker_profile, context=context).data
        if obj.role == UserRole.EMPLOYER and hasattr(obj, "employer_profile"):
            return EmployerProfileSerializer(obj.employer_profile, context=context).data
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    industry = serializers.CharField(write_only=True, required=False, allow_blank=True)
    location = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "full_name",
            "company_name",
            "industry",
            "location",
        )

    def validate_role(self, value):
        if value not in (UserRole.JOB_SEEKER, UserRole.EMPLOYER):
            raise serializers.ValidationError("Registration is limited to job seeker or employer roles.")
        return value

    def create(self, validated_data):
        full_name = validated_data.pop("full_name", "")
        company_name = validated_data.pop("company_name", "")
        industry = validated_data.pop("industry", "")
        location = validated_data.pop("location", "")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)

        if user.role == UserRole.JOB_SEEKER:
            JobSeekerProfile.objects.create(
                user=user,
                full_name=full_name or user.full_name,
                city=location,
            )
        elif user.role == UserRole.EMPLOYER:
            EmployerProfile.objects.create(
                user=user,
                company_name=company_name or user.full_name or user.email,
                industry=industry,
                location=location,
            )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            user = User.objects.get(email=attrs["email"])
        except User.DoesNotExist as exc:
            raise serializers.ValidationError("Invalid email or password.") from exc
        if not user.check_password(attrs["password"]):
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        attrs["user"] = user
        return attrs
