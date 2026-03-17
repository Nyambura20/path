from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from apps.users.models import User
from .models import StudentProfile


def _generate_student_id(user_id):
    return f"STU{user_id:05d}"


@receiver(post_save, sender=User)
def ensure_student_profile(sender, instance, **kwargs):
    """Automatically provision a basic student profile when needed."""
    if instance.role != 'student':
        return

    StudentProfile.objects.get_or_create(
        user=instance,
        defaults={
            'student_id': _generate_student_id(instance.id),
            'year_of_study': '1',
            'major': 'Undeclared',
            'admission_date': timezone.now().date(),
        },
    )
