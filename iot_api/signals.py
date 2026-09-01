from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from .models import MasterDevice, DeviceSensorLink, MasterSensor, SensorParameterLink, MasterParameter

@receiver(post_save, sender=MasterDevice)
def handle_new_device_automation(sender, instance, created, **kwargs):
    # 1. Jab naya device create ho tabhi yeh automation chale
    if created:
        with transaction.atomic():
            base_name = instance.DEVICE_NAME.lower()
            org_id = instance.ORGANIZATION_ID
            centre_id = instance.CENTRE_ID

            sensor_configs = []

            # 2. Category / Name ke hisaab se sensor rules define karein
            if 'voc_2.0' in base_name:
                sensor_configs = [
                    {"name": f"{instance.DEVICE_NAME}_voc_2.0_rt", "type": "Sht40", "param_name": "Room Temperature"},
                    {"name": f"{instance.DEVICE_NAME}_voc_2.0_hum", "type": "Sht40", "param_name": "Humidity"},
                    {"name": f"{instance.DEVICE_NAME}_voc_2.0_voc", "type": "Sgp30", "param_name": "Voc"}
                ]
            elif 'voc' in base_name:
                sensor_configs = [
                    {"name": f"{instance.DEVICE_NAME}_voc_rt", "type": "Dht11", "param_name": "Room Temperature"},
                    {"name": f"{instance.DEVICE_NAME}_voc_hum", "type": "Dht11", "param_name": "Humidity"},
                    {"name": f"{instance.DEVICE_NAME}_voc_voc", "type": "Sgp30", "param_name": "Voc"}
                ]
            elif 'refri' in base_name or 'refricheck' in base_name:
                sensor_configs = [
                    {"name": f"{instance.DEVICE_NAME}_refri", "type": "Pt100", "param_name": "Fridge temp"}
                ]
            elif 'cryo' in base_name or 'cryosafe' in base_name:
                sensor_configs = [
                    {"name": f"{instance.DEVICE_NAME}_cryo", "type": "Pt100", "param_name": "Cryo temperature"}
                ]
            elif 'incubator' in base_name or 'inc' in base_name:
                sensor_configs = [
                    {"name": f"{instance.DEVICE_NAME}_o2", "type": "Inc_o2", "param_name": "Inc_O2"},
                    {"name": f"{instance.DEVICE_NAME}_co2", "type": "Inc_co2", "param_name": "Inc_Co2"},
                    {"name": f"{instance.DEVICE_NAME}_temp", "type": "Inc_temp", "param_name": "Inc_temp_t1"}
                ]

            # 3. Sensors create karein aur links banayein
            for config in sensor_configs:
                # MasterSensor mein naya sensor banayein
                sensor = MasterSensor.objects.create(
                    SENSOR_NAME=config["name"],
                    SENSOR_TYPE=config["type"],
                    SENSOR_STATUS=1
                )

                # Device-Sensor Link table mein entry karein
                DeviceSensorLink.objects.create(
                    DEVICE_ID=instance,
                    SENSOR_ID=sensor,
                    ORGANIZATION_ID=org_id,
                    CENTRE_ID=centre_id
                )

                # Parameter ko dhoond kar Sensor-Parameter Link banayein
                parameter = MasterParameter.objects.filter(PARAMETER_NAME__iexact=config["param_name"]).first()
                if parameter:
                    SensorParameterLink.objects.create(
                        SENSOR_ID=sensor,
                        PARAMETER_ID=parameter
                    )

    # 4. Organization/Centre update hone par links sync karna
    DeviceSensorLink.objects.filter(
        DEVICE_ID=instance.DEVICE_ID
    ).update(
        ORGANIZATION_ID=instance.ORGANIZATION_ID,
        CENTRE_ID=instance.CENTRE_ID
    )
