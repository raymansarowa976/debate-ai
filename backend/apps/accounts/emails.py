from django.conf import settings
from django.core.mail import send_mail


def send_login_verification_email(user, token):
    verify_link = f"{settings.FRONTEND_URL}/verify-login?token={token}"
    send_mail(
        subject="Confirm your login",
        message=(
            "We received a login attempt for your account.\n\n"
            f"Confirm it's you: {verify_link}\n\n"
            "If you didn't try to log in, you can ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )
