from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_user_pending_login_token_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='pending_password_reset_token_id',
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
    ]
