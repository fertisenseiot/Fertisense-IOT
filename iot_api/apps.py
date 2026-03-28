from django.apps import AppConfig

class IotApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'iot_api'

    def ready(self):
        import iot_api.signals   # 🔥 YE LINE IMPORTANT HAI
