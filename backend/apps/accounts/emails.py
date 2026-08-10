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


def send_password_reset_email(user, token):
    # Includes the username as a reminder since this covers "forgot
    # username" too: the account lookup is by email, so the user gets
    # both pieces of information in one message.
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    send_mail(
        subject="Reset your password",
        message=(
            "We received a request to reset the password for your account.\n\n"
            f"Your username is: {user.username}\n\n"
            f"Reset your password: {reset_link}\n\n"
            "If you didn't request this, you can ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )
