from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from .models import MasterDevice, DeviceSensorLink, MasterSensor, SensorParameterLink, MasterParameter

@receiver(post_save, sender=MasterDevice)
def handle_device_automation_and_sync(sender, instance, created, **kwargs):
    with transaction.atomic():
        device_name = instance.DEVICE_NAME.strip()
        base_name = device_name.lower()
        org_id = instance.ORGANIZATION_ID
        centre_id = instance.CENTRE_ID

        sensor_configs = []

        # 1. Exact naming convention ke hisaab se sensor configs define karein
        if 'voc_2.0' in base_name:
            sensor_configs = [
                {"name": f"{device_name}_voc_2.0_rt", "type": "Sht40", "param_name": "Room Temperature"},
                {"name": f"{device_name}_voc_2.0_hum", "type": "Sht40", "param_name": "Humidity"},
                {"name": f"{device_name}_voc_2.0_voc", "type": "Sgp30", "param_name": "Voc"}
            ]
        elif 'voc' in base_name:
            sensor_configs = [
                {"name": f"{device_name}_voc_rt", "type": "Dht11", "param_name": "Room Temperature"},
                {"name": f"{device_name}_voc_hum", "type": "Dht11", "param_name": "Humidity"},
                {"name": f"{device_name}_voc_voc", "type": "Sgp30", "param_name": "Voc"}
            ]
        elif 'refri' in base_name or 'refricheck' in base_name:
            sensor_configs = [
                {"name": f"{device_name}_refri", "type": "Pt100", "param_name": "Fridge temp"}
            ]
        elif 'cryo' in base_name or 'cryosafe' in base_name:
            sensor_configs = [
                {"name": f"{device_name}_cryo", "type": "Pt100", "param_name": "Cryo temperature"}
            ]
        elif 'incubator' in base_name or 'inc' in base_name:
            sensor_configs = [
                {"name": f"{device_name}_o2", "type": "Inc_o2", "param_name": "Inc_O2"},
                {"name": f"{device_name}_co2", "type": "Inc_co2", "param_name": "Inc_Co2"},
                {"name": f"{device_name}_temp", "type": "Inc_temp", "param_name": "Inc_temp_t1"}
            ]

        # 2. Check karein ki is device ke liye sensors pehle se linked hain ya nahi
        existing_links = DeviceSensorLink.objects.filter(DEVICE_ID=instance.DEVICE_ID)

        if created or not existing_links.exists():
            for config in sensor_configs:
                # Agar uss specific name ka sensor pehle se nahi hai toh hi naya banayein (taaki ID jump na ho)
                sensor, s_created = MasterSensor.objects.get_or_create(
                    SENSOR_NAME=config["name"],
                    defaults={
                        "SENSOR_TYPE": config["type"],
                        "SENSOR_STATUS": 1
                    }
                )

                # Device-Sensor Link banayein
                DeviceSensorLink.objects.get_or_create(
                    DEVICE_ID=instance.DEVICE_ID,
                    SENSOR_ID=sensor.SENSOR_ID if hasattr(sensor, 'SENSOR_ID') else sensor.id,
                    defaults={
                        "ORGANIZATION_ID": org_id,
                        "CENTRE_ID": centre_id
                    }
                )

                # Parameter link banayein
                parameter = MasterParameter.objects.filter(PARAMETER_NAME__iexact=config["param_name"]).first()
                if parameter:
                    SensorParameterLink.objects.get_or_create(
                        SENSOR_ID=sensor.SENSOR_ID if hasattr(sensor, 'SENSOR_ID') else sensor.id,
                        PARAMETER_ID=parameter.PARAMETER_ID if hasattr(parameter, 'PARAMETER_ID') else parameter.id
                    )

        # 3. Organization/Centre update hone par links ko sync karna
        DeviceSensorLink.objects.filter(
            DEVICE_ID=instance.DEVICE_ID
        ).update(
            ORGANIZATION_ID=instance.ORGANIZATION_ID,
            CENTRE_ID=instance.CENTRE_ID
        )
