import base64
import hashlib
import hmac
import json

from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed


def _encode_segment(payload):
    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("utf-8")


def _decode_segment(value):
    padding = "=" * (-len(value) % 4)
    return json.loads(base64.urlsafe_b64decode(f"{value}{padding}".encode("utf-8")))


def _sign(value):
    return hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).digest()


def create_token(user, token_type="access"):
    now = timezone.now()
    lifetime = (
        settings.JWT_ACCESS_LIFETIME
        if token_type == "access"
        else settings.JWT_REFRESH_LIFETIME
    )
    payload = {
        "sub": str(user.pk),
        "email": user.email,
        "role": user.role,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + lifetime).timestamp()),
    }
    header = {
        "alg": "HS256",
        "typ": "JWT",
    }
    signing_input = f"{_encode_segment(header)}.{_encode_segment(payload)}"
    signature = base64.urlsafe_b64encode(_sign(signing_input)).rstrip(b"=").decode("utf-8")
    return f"{signing_input}.{signature}"


def decode_token(token, expected_type="access"):
    try:
        header_segment, payload_segment, signature_segment = token.split(".")
    except ValueError as exc:
        raise AuthenticationFailed("Token structure is invalid.") from exc

    signing_input = f"{header_segment}.{payload_segment}"
    expected_signature = base64.urlsafe_b64encode(_sign(signing_input)).rstrip(b"=").decode("utf-8")
    if not hmac.compare_digest(signature_segment, expected_signature):
        raise AuthenticationFailed("Token signature is invalid.")

    payload = _decode_segment(payload_segment)
    if payload.get("exp", 0) < int(timezone.now().timestamp()):
        raise AuthenticationFailed("Token has expired.")
    if expected_type and payload.get("type") != expected_type:
        raise AuthenticationFailed("Unexpected token type.")
    return payload
