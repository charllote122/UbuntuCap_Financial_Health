from django.contrib import admin
from .models import MpesaTransaction, MpesaProfile, MpesaPaymentRequest, MpesaWebhookLog

@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'amount', 'phone_number', 'transaction_date', 'analyzed']
    list_filter = ['transaction_type', 'transaction_category', 'analyzed', 'transaction_date']
    search_fields = ['user__phone_number', 'mpesa_receipt_number', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 20

@admin.register(MpesaProfile)
class MpesaProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'average_weekly_income', 'transaction_consistency', 'has_savings_habit', 'last_analysis']
    list_filter = ['has_savings_habit', 'last_analysis']
    search_fields = ['user__phone_number']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(MpesaPaymentRequest)
class MpesaPaymentRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'amount', 'status', 'created_at', 'callback_received_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__phone_number', 'checkout_request_id']
    readonly_fields = ['created_at']

@admin.register(MpesaWebhookLog)
class MpesaWebhookLogAdmin(admin.ModelAdmin):
    list_display = ['webhook_type', 'created_at', 'processed', 'response_status']
    list_filter = ['webhook_type', 'processed', 'created_at']
    readonly_fields = ['created_at', 'processed_at']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False