from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField("email address", unique=True)
    pending_login_token_id = models.CharField(max_length=64, null=True, blank=True)
