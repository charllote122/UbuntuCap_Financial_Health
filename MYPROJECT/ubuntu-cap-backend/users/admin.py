from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile, UserConsent, VerificationCode, UserActivity

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['phone_number', 'first_name', 'last_name', 'is_verified', 'is_active', 'date_joined']
    list_filter = ['is_verified', 'is_active', 'is_staff', 'registration_channel', 'date_joined']
    search_fields = ['phone_number', 'first_name', 'last_name', 'email']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'id_number')}),
        ('Status', {'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser')}),
        ('Registration', {'fields': ('registration_channel',)}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'county', 'town', 'employment_status', 'profile_completion_percentage']
    list_filter = ['gender', 'employment_status', 'county']
    search_fields = ['user__phone_number', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(UserConsent)
class UserConsentAdmin(admin.ModelAdmin):
    list_display = ['user', 'consent_type', 'consented', 'timestamp']
    list_filter = ['consent_type', 'consented', 'timestamp']
    search_fields = ['user__phone_number']
    readonly_fields = ['timestamp']

@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'verification_type', 'is_used', 'created_at', 'expires_at']
    list_filter = ['verification_type', 'is_used', 'created_at']
    search_fields = ['user__phone_number', 'code']
    readonly_fields = ['created_at']

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'activity_type', 'timestamp', 'ip_address']
    list_filter = ['activity_type', 'timestamp']
    search_fields = ['user__phone_number', 'description']
    readonly_fields = ['timestamp']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False