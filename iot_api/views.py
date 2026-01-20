# iot_api/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


from .models import (
    MasterDevice, DeviceReadingLog, DeviceAlarmLog, 
    MasterOrganization, MasterParameter, MasterSensor,
    CompassDates, SeUser, SensorParameterLink, DeviceSensorLink, DeviceAlarmCallLog , MasterUOM , MasterCentre , MasterRole , CentreOrganizationLink , MasterUser, UserOrganizationCentreLink,MasterNotificationTime , DeviceCategory ,MasterSubscriptionInfo , Master_Plan_Type, SubscriptionHistory,DeviceStatusAlarmLog
)
from .serializers import (
    MasterDeviceSerializer, DeviceReadingLogSerializer, DeviceAlarmLogSerializer,
    MasterOrganizationSerializer, MasterParameterSerializer, MasterSensorSerializer,
    CompassDatesSerializer, SeUserSerializer, SensorParameterLinkSerializer,
    DeviceSensorLinkSerializer, DeviceAlarmCallLogSerializer , MasterUOMSerializer , MasterCentreSerializer , MasterRoleSerializer , CentreOrganizationLinkSerializer,MasterUserSerializer,UserOrganizationCentreLinkSerializer,MasterNotificationTimeSerializer , DeviceCategorySerializer , MasterSubscriptionInfoSerializer , Master_PlanTypeSerializer,Subscription_HistorySerializer,DeviceStatusAlarmLogSerializer
)

from django.contrib import messages
from django.db import connection


# -------------------------
# Login View
# -------------------------
def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT USER_ID, USERNAME, ROLE_ID 
                FROM master_user 
                WHERE USERNAME=%s AND PASSWORD=%s
            """, [username, password])
            row = cursor.fetchone()

        if row:
            user_id, username, role = row

            # ✅ Store all details in session
            request.session["user_id"] = user_id
            request.session["username"] = username
            request.session["role"] = role

            # Role ke hisaab se redirect
            if role == 1:
                return redirect("dashboard")
            else:
                return redirect("user")
        else:
            messages.error(request, "Invalid username or password")
    
    return render(request, "login.html")

# -------------------------
# Logout View
# -------------------------
def logout_view(request):
    logout(request)
    return redirect('login')

def user_dashboard(request):
    return render(request, "user_dashboard.html")

# -------------------------
# Dashboard View
# -------------------------
# @login_required
def dashboard_view(request):
    role = request.session.get("role")
    if not role:  # agar login nahi hai
        return redirect("login")
    if role != 1:  # agar admin nahi hai
        return redirect("user")  # user dashboard

    context = {
        'devices_count': MasterDevice.objects.count(),
        'readings_count': DeviceReadingLog.objects.count(),
        'alarms_count': DeviceAlarmLog.objects.count(),
        'organizations_count': MasterOrganization.objects.count(),
        'parameters_count': MasterParameter.objects.count(),
        'sensors_count': MasterSensor.objects.count(),
        'compass_count': CompassDates.objects.count(),
        'users_count': SeUser.objects.count(),
        'sensor_links_count': SensorParameterLink.objects.count(),
        'device_links_count': DeviceSensorLink.objects.count(),
        'alarm_calls_count': DeviceAlarmCallLog.objects.count(),
        'uom_count': MasterUOM.objects.count(),
        'centre_count': MasterCentre.objects.count(),
        'role_count' : MasterRole.objects.count(),
        'centre_links_count': CentreOrganizationLink.objects.count(),
        'master_user_count' : MasterUser.objects.count(),
        'user_organization_centre_link_count': UserOrganizationCentreLink.objects.count(),
        'device_category': DeviceCategory.objects.count(),
        'master_subcriptioninfo': MasterSubscriptionInfo.objects.count(),
        'plan_type': Master_Plan_Type.objects.count(),
        'subscription_history': SubscriptionHistory.objects.count(),
        'devicestatusalarmlog' : DeviceStatusAlarmLog.objects.count(),

    }
    return render(request, 'dashboard.html', context)

# -------------------------
# SMS Test View
# -------------------------
# def some_iot_alert_view(request):
#     try:
#         sms_sid = send_sms('+917355383021', 'Alert! IoT device reading high.')
#         return HttpResponse(f"SMS sent successfully! SID: {sms_sid}")
#     except Exception as e:
#         return HttpResponse(f"Failed to send SMS: {e}")

# -------------------------
# DRF ViewSets for all models
# -------------------------
class MasterDeviceViewSet(viewsets.ModelViewSet):
    queryset = MasterDevice.objects.all()
    serializer_class = MasterDeviceSerializer

class DeviceReadingLogViewSet(viewsets.ModelViewSet):
    queryset = DeviceReadingLog.objects.all()
    serializer_class = DeviceReadingLogSerializer

class DeviceAlarmLogViewSet(viewsets.ModelViewSet):
    queryset = DeviceAlarmLog.objects.all()
    serializer_class = DeviceAlarmLogSerializer

class MasterOrganizationViewSet(viewsets.ModelViewSet):
    queryset = MasterOrganization.objects.all()
    serializer_class = MasterOrganizationSerializer
    permission_classes = [AllowAny]   # 👈 yeh add karo

class MasterParameterViewSet(viewsets.ModelViewSet):
    queryset = MasterParameter.objects.all()
    serializer_class = MasterParameterSerializer

class MasterSensorViewSet(viewsets.ModelViewSet):
    queryset = MasterSensor.objects.all()
    serializer_class = MasterSensorSerializer

class CompassDatesViewSet(viewsets.ModelViewSet):
    queryset = CompassDates.objects.all()
    serializer_class = CompassDatesSerializer

class SeUserViewSet(viewsets.ModelViewSet):
    queryset = SeUser.objects.all()
    serializer_class = SeUserSerializer

class SensorParameterLinkViewSet(viewsets.ModelViewSet):
    queryset = SensorParameterLink.objects.all()
    serializer_class = SensorParameterLinkSerializer

class DeviceSensorLinkViewSet(viewsets.ModelViewSet):
    queryset = DeviceSensorLink.objects.all()
    serializer_class = DeviceSensorLinkSerializer

class DeviceAlarmCallLogViewSet(viewsets.ModelViewSet):
    queryset = DeviceAlarmCallLog.objects.all()
    serializer_class = DeviceAlarmCallLogSerializer

class MasterUOMViewSet(viewsets.ModelViewSet):
    queryset = MasterUOM.objects.all()
    serializer_class = MasterUOMSerializer

class MasterCentreViewSet(viewsets.ModelViewSet):
    queryset = MasterCentre.objects.all()
    serializer_class = MasterCentreSerializer

class MasterRoleViewSet(viewsets.ModelViewSet):
    queryset = MasterRole.objects.all()
    serializer_class = MasterRoleSerializer

class CentreOrganizationLinkViewSet(viewsets.ModelViewSet):
    queryset = CentreOrganizationLink.objects.all()
    serializer_class = CentreOrganizationLinkSerializer

class MasterUserViewSet(viewsets.ModelViewSet):
    queryset = MasterUser.objects.all()
    serializer_class = MasterUserSerializer

class UserOrganizationCentreLinkViewSet(viewsets.ModelViewSet):
    queryset = UserOrganizationCentreLink.objects.all()
    serializer_class = UserOrganizationCentreLinkSerializer

class MasterNotificationTimeViewSet(viewsets.ModelViewSet):
    queryset = MasterNotificationTime.objects.all()
    serializer_class = MasterNotificationTimeSerializer

class DeviceCategoryViewSet(viewsets.ModelViewSet):
    queryset = DeviceCategory.objects.all()
    serializer_class = DeviceCategorySerializer

class MasterSubscriptionInfoViewSet(viewsets.ModelViewSet):
    queryset = MasterSubscriptionInfo.objects.all()
    serializer_class = MasterSubscriptionInfoSerializer

class MasterPlanTypeViewSet(viewsets.ModelViewSet):
    queryset = Master_Plan_Type.objects.all()
    serializer_class = Master_PlanTypeSerializer

class Subscription_HistoryViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionHistory.objects.all()
    serializer_class = Subscription_HistorySerializer

class DeviceStatusAlarmLogViewSet(viewsets.ModelViewSet):
    queryset = DeviceStatusAlarmLog.objects.all()
    serializer_class = DeviceStatusAlarmLogSerializer

# -------------------------
# Extra Simple APIs for JS
# -------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def current_user_api(request):
    """Return currently logged in user from session"""
    user_id = request.session.get("user_id")
    username = request.session.get("username")
    role = request.session.get("role")

    if not user_id:
        return Response({"error": "Not logged in"}, status=401)

    return Response({
        "USER_ID": user_id,
        "USERNAME": username,
        "ROLE_ID": role,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def user_org_centre_api(request):
    """Return user's Organization and Centre mapping"""
    user_id = request.GET.get("USER_ID")
    if not user_id:
        return Response({"error": "USER_ID required"}, status=400)

    links = UserOrganizationCentreLink.objects.filter(USER_ID=user_id)
    serializer = UserOrganizationCentreLinkSerializer(links, many=True)
    return Response(serializer.data)


# from datetime import date
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from .models import SubscriptionHistory, MasterDevice  # import models as needed

# from datetime import date
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from .models import SubscriptionHistory, MasterSubscriptionInfo

# @api_view(['GET'])
# def devicecheck(request):
#     today = date.today()
#     results = []

#     subscriptions = SubscriptionHistory.objects.all()

#     for sub in subscriptions:
#         # ✅ Fetch Plan Type Name
#         plan = Master_Plan_Type.objects.filter(Plan_ID=sub.Plan_ID).first()
#         plan_name = plan.Plan_Name if plan else "Unknown Plan"

#         # ✅ Append only required fields
#         results.append({
#             "Device_ID": sub.Device_ID,
#             "Plan_Type": plan_name,
#             "Subcription_End_Date": sub.Subcription_End_date.strftime("%Y-%m-%d") if sub.Subcription_End_date else None
#         })

#     return Response({
#         "date_checked": today.strftime("%Y-%m-%d"),
#         "devices": results,
#         "total_count": len(results)
#     })


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import MasterDevice, MasterSubscriptionInfo, Master_Plan_Type, SubscriptionHistory


@api_view(['GET'])
@permission_classes([AllowAny])
def devicecheck(request, device_id):

    # ✅ Check if device exists
    device = get_object_or_404(MasterDevice, DEVICE_ID=device_id)

    # ✅ Get latest subscription history entry for this device
    sub = SubscriptionHistory.objects.filter(Device_ID=device_id).last()
    if not sub:
        return Response({
            "device_id": device_id,
            "plan_type": None,
            "valid_till": None
        })

    # ✅ Fetch plan type
    plan = Master_Plan_Type.objects.filter(Plan_ID=sub.Plan_ID).first()
    plan_type = plan.Plan_Name if plan else "Unknown"

    # ✅ Fetch package name
    # package = MasterSubscriptionInfo.objects.filter(Subscription_ID=sub.Subscription_ID).first()
    # package_name = package.Package_Name if package else "Unknown"

    # ✅ Return final response
    return Response({
        "device_id": device_id,
        "plan_type": plan_type,
        "valid_till": sub.Subcription_End_date.strftime("%Y-%m-%d") if sub.Subcription_End_date else None
    })

# ================================
# Twilio Call Status Webhook
# ================================
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.utils import timezone
from django.db import connection

from twilio.rest import Client
import os

from .models import DeviceAlarmCallLog



# ======================
# TWILIO CONFIG
# ======================
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_TOKEN = os.getenv("TWILIO_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_NUMBER")

twilio = Client(TWILIO_SID, TWILIO_TOKEN)


# ======================
# MESSAGE BUILDER
# ======================
def build_message(ntf_typ, devnm):
    messages = {
        1: f"WARNING!! The Temperature of {devnm} has dipped below the lower limit. Please take necessary action- Regards Fertisense LLP",
        2: f"WARNING!! The Temperature of {devnm} has crossed the higher limit. Please take necessary action- Regards Fertisense LLP",
        3: f"WARNING!! The {devnm} is offline. Please take necessary action- Regards Fertisense LLP",
        4: f"WARNING!! The level of liquid nitrogen in {devnm} is low. Please take necessary action- Regards Fertisense LLP",
        5: f"INFO!! The device {devnm} is back online. No action is required - Regards Fertisense LLP",
        6: f"INFO!! The level of Liquid Nitrogen is back to normal for {devnm}. No action is required - Regards Fertisense LLP",
        7: f"INFO!! The temperature levels are back to normal for {devnm}. No action is required - Regards Fertisense LLP",
        8: f"WARNING!! The room temperature reading in {devnm} has dipped below the lower limit. Please take necessary action- Regards Fertisense LLP",
        9: f"WARNING!! The room temperature reading in {devnm} has gone above the higher limit. Please take necessary action- Regards Fertisense LLP",
        10: f"INFO!! The room temperature levels are back to normal in {devnm}. No action is required - Regards Fertisense LLP",
        11: f"WARNING!! The humidity reading in {devnm} has dipped below the lower limit. Please take necessary action- Regards Fertisense LLP",
        12: f"WARNING!! The humidity reading in {devnm} has gone above the higher limit. Please take necessary action- Regards Fertisense LLP",
        13: f"INFO!! The humidity levels are back to normal in {devnm}. No action is required - Regards Fertisense LLP",
        14: f"WARNING!! The VOC reading in {devnm} has dipped below the lower limit. Please take necessary action- Regards Fertisense LLP",
        15: f"WARNING!! The VOC reading in {devnm} has gone above the higher limit. Please take necessary action- Regards Fertisense LLP",
        16: f"INFO!! The VOC levels are back to normal in {devnm}. No action is required - Regards Fertisense LLP",
        17: f"WARNING!! The CO2 reading in {devnm} has dipped below the lower limit. Please take necessary action - Regards Fertisense LLP",
        18: f"WARNING!! The CO2 reading in {devnm} has gone above the higher limit. Please take necessary action - Regards Fertisense LLP",
        19: f"INFO!! The CO2 levels are back to normal in {devnm}. No action is required - Regards Fertisense LLP",
        20: f"WARNING!! The O2 reading in {devnm} has dipped below the lower limit. Please take necessary action - Regards Fertisense LLP",
        21: f"WARNING!! The O2 reading in {devnm} has gone above the higher limit. Please take necessary action - Regards Fertisense LLP",
        22: f"INFO!! The O2 levels are back to normal in {devnm}. No action is required - Regards Fertisense LLP",
        23: f"WARNING!! The Incubator temperature of {devnm} has crossed the higher limit. Please take necessary action - Regards Fertisense LLP",
        24: f"WARNING!! The Incubator temperature of {devnm} has dipped below the lower limit. Please take necessary action - Regards Fertisense LLP",
        25: f"INFO!! The Incubator temperature levels are back to normal for {devnm}. No action is required - Regards Fertisense LLP",
    }
    return messages.get(ntf_typ, f"Alert for {devnm} - Regards Fertisense LLP")


# ======================
# GET NEXT OPERATOR (SAME ORG + CENTRE)
# ======================
def get_next_operator(alarm_id):
    cursor = connection.cursor()

    # already tried numbers
    cursor.execute("""
        SELECT PHONE_NUM
        FROM iot_api_devicealarmcalllog
        WHERE ALARM_ID = %s
    """, [alarm_id])
    tried = [r[0] for r in cursor.fetchall()]

    # get org + centre from device
    cursor.execute("""
        SELECT ORGANIZATION_ID, CENTRE_ID
        FROM iot_api_masterdevice
        WHERE DEVICE_ID = (
            SELECT DEVICE_ID
            FROM iot_api_devicealarmcalllog
            WHERE ALARM_ID = %s
            LIMIT 1
        )
    """, [alarm_id])
    row = cursor.fetchone()
    if not row:
        return None

    org_id, centre_id = row

    cursor.execute("""
        SELECT mu.PHONE
        FROM userorganizationcentrelink u
        JOIN master_user mu ON mu.USER_ID = u.USER_ID_id
        WHERE u.ORGANIZATION_ID_id = %s
          AND u.CENTRE_ID_id = %s
          AND mu.ROLE_ID = 3
          AND mu.SEND_SMS = 1
          AND mu.PHONE NOT IN %s
        ORDER BY mu.USER_ID
        LIMIT 1
    """, [org_id, centre_id, tuple(tried) if tried else ('',)])

    row = cursor.fetchone()
    return row[0] if row else None


# ======================
# MAKE ROBO CALL
# ======================
def make_robo_call(phone, message):
    call = twilio.calls.create(
        to=phone,
        from_=TWILIO_NUMBER,
        twiml=f"<Response><Say voice='alice' language='en-IN'>{message}</Say></Response>",
        timeout=60,
        status_callback="https://fertisense-iot-production.up.railway.app/twilio/call-status/",
        status_callback_event=["answered", "completed", "busy", "no-answer", "failed"],
    )
    return call.sid


# ======================
# TWILIO WEBHOOK (FINAL)
# ======================
@csrf_exempt
def twilio_call_status(request):
    if request.method != "POST":
        return HttpResponse("Method Not Allowed", status=405)

    call_sid = request.POST.get("CallSid")
    call_status = request.POST.get("CallStatus")

    if not call_sid:
        return HttpResponse("Missing CallSid", status=400)

    call = DeviceAlarmCallLog.objects.filter(CALL_SID=call_sid).first()
    if not call:
        return HttpResponse("Call not found", status=404)

    now = timezone.now()

    # ✅ INTEGER TIME (MODEL SAFE)
    call.CALL_DATE = now.date()
    call.CALL_TIME = now.hour * 10000 + now.minute * 100 + now.second
    call.LST_UPD_DT = now.date()

    # ✅ STATUS (AS PER YOUR ENUM)
    if call_status == "completed":
        call.CALL_STATUS = 1   # COMPLETED
        call.save()
        return HttpResponse("Answered")

    elif call_status in ("no-answer", "busy", "canceled"):
        call.CALL_STATUS = 3   # NO_ANSWER

    elif call_status == "failed":
        call.CALL_STATUS = 2   # FAILED

    else:
        return HttpResponse("Ignored")

    call.save()

    # 🔒 stop if already answered
    if DeviceAlarmCallLog.objects.filter(
        ALARM_ID=call.ALARM_ID,
        CALL_STATUS=1
    ).exists():
        return HttpResponse("Already handled")

    # ⛔ max retry = 3
    if DeviceAlarmCallLog.objects.filter(ALARM_ID=call.ALARM_ID).count() >= 3:
        return HttpResponse("Max retries reached")

    # 📞 NEXT CALL
    next_phone = get_next_operator(call.ALARM_ID)
    if not next_phone:
        return HttpResponse("No more operators")

    new_sid = make_robo_call(
        next_phone,
        build_message(1, f"Device-{call.DEVICE_ID}")
    )

    DeviceAlarmCallLog.objects.create(
        ALARM_ID=call.ALARM_ID,
        DEVICE_ID=call.DEVICE_ID,
        PHONE_NUM=next_phone,
        CALL_DATE=now.date(),
        CALL_TIME=now.hour * 10000 + now.minute * 100 + now.second,
        CALL_SID=new_sid,
        CALL_STATUS=0
    )

    return HttpResponse("Next call triggered")
