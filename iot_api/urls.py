from django.urls import path, include
from rest_framework import routers
from django.urls import path, include
from rest_framework import routers
from . import views
from .views import current_user_api, user_org_centre_api
from .views import twilio_call_status
from .views import hardware_payment_status_api


from .views import (
    DeviceReadingLogViewSet, MasterDeviceViewSet, CompassDatesViewSet,
    MasterOrganizationViewSet, MasterParameterViewSet, MasterSensorViewSet,
    SeUserViewSet, SensorParameterLinkViewSet, DeviceSensorLinkViewSet,
    DeviceAlarmCallLogViewSet, DeviceAlarmLogViewSet, MasterUOMViewSet , MasterCentreViewSet, MasterRoleViewSet ,CentreOrganizationLinkViewSet, MasterUserViewSet , UserOrganizationCentreLinkViewSet, MasterNotificationTimeViewSet , DeviceCategoryViewSet , MasterSubscriptionInfoViewSet, MasterPlanTypeViewSet, Subscription_HistoryViewSet,DeviceStatusAlarmLogViewSet,EmailReportLogViewSet, user_subscription_status_api,AddReadingByMacIdView,hardware_payment_status_mac_api,devicecheck_mac)

# Router setup
router = routers.DefaultRouter()
router.register(r'devicereadinglog', DeviceReadingLogViewSet)
router.register(r'masterdevice', MasterDeviceViewSet)
router.register(r'compassdates', CompassDatesViewSet)
router.register(r'masterorganization', MasterOrganizationViewSet)
router.register(r'masterparameter', MasterParameterViewSet)
router.register(r'mastersensor', MasterSensorViewSet)
router.register(r'seuser', SeUserViewSet)
router.register(r'sensorparameterlink', SensorParameterLinkViewSet)
router.register(r'devicesensorlink', DeviceSensorLinkViewSet)
router.register(r'devicealarmcalllog', DeviceAlarmCallLogViewSet)
router.register(r'devicealarmlog', DeviceAlarmLogViewSet)
router.register(r'masteruom', MasterUOMViewSet)
router.register(r'mastercentre', MasterCentreViewSet)
router.register(r'masterrole', MasterRoleViewSet)
router.register(r'centreorganizationlink' , CentreOrganizationLinkViewSet)
router.register(r'masteruser', MasterUserViewSet)
router.register(r'userorganizationcentrelink', UserOrganizationCentreLinkViewSet )
router.register(r'masternotificationtime', MasterNotificationTimeViewSet)
router.register(r'devicecategory' , DeviceCategoryViewSet)
router.register(r'mastersubscriptioninfo', MasterSubscriptionInfoViewSet)
router.register(r'masterplantype', MasterPlanTypeViewSet)
router.register(r'subscriptionhistory', Subscription_HistoryViewSet)
router.register(r'devicestatusalarmlog', DeviceStatusAlarmLogViewSet)
router.register(r'emailreportlog', EmailReportLogViewSet)


urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('user/', views.user_dashboard, name='user'),
    # path('alert/', views.some_iot_alert_view, name='alert'),
    
    path("currentuser/", current_user_api),
    path("userorgcentre/", user_org_centre_api),

    path('', include(router.urls)),
    # path('api/devicecheck/', views.devicecheck, name='devicecheck'),
    path('devicecheck/<int:device_id>/', views.devicecheck, name='devicecheck'),
    path("twilio/call-status/", twilio_call_status),
   
   path(
    'hardware-payment-status-api/',
    hardware_payment_status_api,
    name='hardware_payment_status_api'
),

path('api/subscription-status/', user_subscription_status_api, name='subscription_status_api'),

path('api/add-reading-mac/', AddReadingByMacIdView.as_view(), name='add_reading_mac'),

# Nayi MAC ID wali checking APIs
    path('api/hardware-payment-mac/', hardware_payment_status_mac_api, name='hardware_payment_mac'),
    path('api/device-check-mac/', devicecheck_mac, name='device_check_mac'),

]
