from rest_framework import serializers
from .models import Loan, LoanApplication, Repayment
from users.models import User

class LoanApplicationSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LoanApplication
        fields = [
            'id', 'user', 'user_phone', 'user_name', 'requested_amount', 
            'requested_term', 'purpose', 'status', 'rejection_reason',
            'reviewed_at', 'created_at'
        ]
        read_only_fields = ['user', 'status', 'reviewed_at', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.full_name

class LoanApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanApplication
        fields = ['requested_amount', 'requested_term', 'purpose']
    
    def validate_requested_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Requested amount must be greater than 0")
        return value
    
    def validate_requested_term(self, value):
        if value <= 0:
            raise serializers.ValidationError("Requested term must be greater than 0")
        return value

class LoanSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    user_name = serializers.SerializerMethodField()
    days_remaining = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Loan
        fields = [
            'id', 'user', 'user_phone', 'user_name', 'principal_amount', 
            'interest_rate', 'total_amount_due', 'amount_disbursed', 
            'term_days', 'disbursed_at', 'due_date', 'repaid_at', 'status',
            'days_remaining', 'is_overdue', 'created_at'
        ]
        read_only_fields = ['user', 'status', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.full_name

class RepaymentSerializer(serializers.ModelSerializer):
    loan_id = serializers.CharField(source='loan.id', read_only=True)
    
    class Meta:
        model = Repayment
        fields = [
            'id', 'loan', 'loan_id', 'amount', 'payment_method', 'status',
            'mpesa_transaction_id', 'mpesa_receipt_number', 'paid_at', 'created_at'
        ]
        read_only_fields = ['status', 'paid_at', 'created_at']