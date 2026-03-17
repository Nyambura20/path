from django.db import migrations
from django.utils import timezone


def _generate_student_id(user_id):
    return f"STU{user_id:05d}"


def create_missing_profiles(apps, schema_editor):
    User = apps.get_model('users', 'User')
    StudentProfile = apps.get_model('students', 'StudentProfile')
    today = timezone.now().date()

    for user in User.objects.filter(role='student'):
        StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                'student_id': _generate_student_id(user.id),
                'year_of_study': '1',
                'major': 'Undeclared',
                'admission_date': today,
            },
        )


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0001_initial'),
        ('users', '0003_user_email_verified_alter_user_is_active_and_more'),
    ]

    operations = [
        migrations.RunPython(create_missing_profiles, reverse_noop),
    ]
