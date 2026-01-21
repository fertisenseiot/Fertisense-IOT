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

from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db import transaction
from django.http import HttpResponse
from django.db import connection

from .models import DeviceAlarmCallLog
from .models import make_robo_call
from.models import normalize_phone

# --------------------------------------------------
# GET NEXT OPERATOR (excluding previous phone)
# --------------------------------------------------
def get_next_operator(alarm_id, exclude_phone):
    cursor = connection.cursor()

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
          AND mu.PHONE != %s
        ORDER BY mu.USER_ID
        LIMIT 1
    """, [org_id, centre_id, exclude_phone])

    row = cursor.fetchone()
    return row[0] if row else None


# --------------------------------------------------
# TWILIO STATUS WEBHOOK (FINAL)
# --------------------------------------------------
@csrf_exempt
@transaction.atomic
def twilio_call_status(request):

    call_sid = request.POST.get("CallSid")
    status = request.POST.get("CallStatus")

    if not call_sid:
        return HttpResponse("OK")

    call = (
        DeviceAlarmCallLog.objects
        .select_for_update()
        .filter(CALL_SID=call_sid)
        .first()
    )

    if not call:
        return HttpResponse("OK")

    # 🔒 duplicate webhook protection
    if call.CALL_STATUS != 0:
        return HttpResponse("OK")

    # --------------------------------------------------
    # UPDATE CURRENT CALL STATUS
    # --------------------------------------------------
    if status in ("completed", "answered"):
        call.CALL_STATUS = 1   # ANSWERED
        call.save()
        return HttpResponse("Answered - Stop flow")

    elif status in ("busy", "no-answer"):
        call.CALL_STATUS = 3   # NO ANSWER
    else:
        call.CALL_STATUS = 2   # FAILED

    call.save()

    # --------------------------------------------------
    # STOP if any call already answered
    # --------------------------------------------------
    if DeviceAlarmCallLog.objects.filter(
        ALARM_ID=call.ALARM_ID,
        CALL_STATUS=1
    ).exists():
        return HttpResponse("Handled")

    # --------------------------------------------------
    # MAX RETRY GUARD (IMPORTANT)
    # --------------------------------------------------
    attempts = DeviceAlarmCallLog.objects.filter(
        ALARM_ID=call.ALARM_ID
    ).count()

    if attempts >= 3:
        return HttpResponse("Max retry reached")

    # --------------------------------------------------
    # FIND NEXT OPERATOR
    # --------------------------------------------------
    next_phone = get_next_operator(call.ALARM_ID, call.PHONE_NUM)
    if not next_phone:
        return HttpResponse("No operator left")

    # --------------------------------------------------
    # TRIGGER NEXT CALL
    # --------------------------------------------------
    message = f"Critical alert for Device {call.DEVICE_ID}"
    # new_sid = make_robo_call(next_phone, message)
    # 🔥 STEP A: normalize number
    next_phone = normalize_phone(next_phone)

    print("☎ FINAL CALLING NUMBER =", next_phone)

    # 🔥 STEP B: call twilio
    new_sid = make_robo_call(next_phone, message)


    # ❌ Twilio call creation failed (trial / auth / unverified)
    if not new_sid:
        return HttpResponse("Call creation failed")

    # --------------------------------------------------
    # LOG NEXT CALL (ONLY IF SID EXISTS)
    # --------------------------------------------------
    DeviceAlarmCallLog.objects.create(
        ALARM_ID=call.ALARM_ID,
        DEVICE_ID=call.DEVICE_ID,
        SENSOR_ID=call.SENSOR_ID,
        PARAMETER_ID=call.PARAMETER_ID,
        ALARM_DATE=call.ALARM_DATE,
        ALARM_TIME=call.ALARM_TIME,
        PHONE_NUM=next_phone,
        CALL_DATE=timezone.now().date(),
        CALL_TIME=timezone.now().time(),
        ORGANIZATION_ID=call.ORGANIZATION_ID,
        CENTRE_ID=call.CENTRE_ID,
        CALL_SID=new_sid,
        CALL_STATUS=0   # PENDING
    )

    return HttpResponse("Next call triggered")

