from django.apps import AppConfig


class StudentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.students'

    def ready(self):
        import apps.students.signals  # noqa: F401
