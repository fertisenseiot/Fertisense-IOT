# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import DeviceReadingLog, MasterParameter
# from .utils import send_sms_alert

# @receiver(post_save, sender=DeviceReadingLog)
# def trigger_alert_on_high_temp(sender, instance, created, **kwargs):
#     if created:  # nayi entry insert hone par hi chale
#         try:
#             # Parameter ka threshold nikaalo
#             parameter = MasterParameter.objects.get(id=instance.PARAMETER_ID)

#             if instance.READING and parameter.THRESHOLD_VALUE is not None:
#                 if instance.READING > parameter.THRESHOLD_VALUE:
#                     message = (
#                         f"⚠️ Alert! Device {instance.DEVICE_ID} - "
#                         f"{parameter.PARAMETER_NAME} = {instance.READING} "
#                         f"(Threshold {parameter.THRESHOLD_VALUE})"
#                     )
#                     send_sms_alert("+91XXXXXXXXXX", message)  # yahan apna number daal
#         except MasterParameter.DoesNotExist:
#             pass  # agar parameter na mile toh ignore

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import MasterDevice, DeviceSensorLink

@receiver(post_save, sender=MasterDevice)
def update_device_links(sender, instance, **kwargs):

    DeviceSensorLink.objects.filter(
        DEVICE_ID=instance.DEVICE_ID
    ).update(
        ORGANIZATION_ID=instance.ORGANIZATION_ID,
        CENTRE_ID=instance.CENTRE_ID
    )
