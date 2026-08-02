import uuid
from datetime import timedelta

import jwt
from django.conf import settings
from django.utils import timezone

LOGIN_VERIFICATION_PURPOSE = "login_verification"


class InvalidLoginToken(Exception):
    pass


def generate_login_verification_token(user):
    jti = uuid.uuid4().hex
    user.pending_login_token_id = jti
    user.save(update_fields=["pending_login_token_id"])

    payload = {
        "sub": user.id,
        "jti": jti,
        "purpose": LOGIN_VERIFICATION_PURPOSE,
        "exp": timezone.now() + timedelta(seconds=settings.LOGIN_TOKEN_TTL_SECONDS),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")


def consume_login_verification_token(token, user_model):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise InvalidLoginToken("Invalid or expired token.") from exc

    if payload.get("purpose") != LOGIN_VERIFICATION_PURPOSE:
        raise InvalidLoginToken("Invalid token purpose.")

    try:
        user = user_model.objects.get(pk=payload.get("sub"))
    except user_model.DoesNotExist as exc:
        raise InvalidLoginToken("User no longer exists.") from exc

    jti = payload.get("jti")
    if not jti or jti != user.pending_login_token_id:
        raise InvalidLoginToken("Token has already been used.")

    user.pending_login_token_id = None
    user.save(update_fields=["pending_login_token_id"])
    return user
