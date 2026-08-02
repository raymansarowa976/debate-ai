from django.urls import path

from .views import (
    CsrfView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    VerifyLoginView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("verify/", VerifyLoginView.as_view(), name="auth-verify"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("csrf/", CsrfView.as_view(), name="auth-csrf"),
]
