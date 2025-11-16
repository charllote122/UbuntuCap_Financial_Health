from django.contrib import admin
from .models import Loan, Repayment, LoanApplication

@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'principal_amount', 'interest_rate', 'status', 'created_at', 'due_date']
    list_filter = ['status', 'created_at']
    search_fields = ['user__phone_number', 'id']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 20

@admin.register(Repayment)
class RepaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'loan', 'amount', 'payment_method', 'status', 'paid_at']
    list_filter = ['status', 'payment_method', 'paid_at']
    search_fields = ['loan__id', 'mpesa_transaction_id']
    readonly_fields = ['created_at']

@admin.register(LoanApplication)
class LoanApplicationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'requested_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__phone_number', 'id']
    readonly_fields = ['created_at', 'updated_at']