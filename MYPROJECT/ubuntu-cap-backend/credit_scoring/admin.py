from django.contrib import admin
from .models import CreditScore, LoanOffer

@admin.register(CreditScore)
class CreditScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'score', 'model_version', 'calculated_at']
    list_filter = ['model_version', 'calculated_at']
    search_fields = ['user__phone_number']
    readonly_fields = ['calculated_at']

@admin.register(LoanOffer)
class LoanOfferAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount_offered', 'interest_rate', 'status', 'created_at', 'expires_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__phone_number']
    readonly_fields = ['created_at']