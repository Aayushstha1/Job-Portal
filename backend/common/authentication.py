from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from common.jwt import decode_token


class JWTAuthentication(BaseAuthentication):
    keyword = b"bearer"

    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        if not auth:
            return None
        if auth[0].lower() != self.keyword:
            return None
        if len(auth) != 2:
            raise AuthenticationFailed("Authorization header must contain a single token.")

        token = auth[1].decode("utf-8")
        payload = decode_token(token, expected_type="access")
        user_model = get_user_model()
        try:
            user = user_model.objects.get(pk=payload["sub"], is_active=True)
        except user_model.DoesNotExist as exc:
            raise AuthenticationFailed("User not found.") from exc
        return (user, payload)
