from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register_user, name='register-user'),
    path('verify-phone/', views.verify_phone, name='verify-phone'),
    path('login/', views.login_user, name='login-user'),
    path('logout/', views.logout_user, name='logout-user'),
    
    # Password Management
    path('password-reset/', views.request_password_reset, name='request-password-reset'),
    path('password-reset-confirm/', views.confirm_password_reset, name='confirm-password-reset'),
    
    # Profile Management
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
    path('consent/', views.record_consent, name='record-consent'),
    
    # Dashboard
    path('dashboard/', views.user_dashboard, name='user-dashboard'),
]