from django.db import models
import uuid
from django.utils import timezone
from users.models import User

class MpesaTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('C2B', 'Customer to Business'),
        ('B2C', 'Business to Customer'),
        ('C2C', 'Customer to Customer'),
        ('B2B', 'Business to Business'),
    ]
    
    TRANSACTION_CATEGORIES = [
        ('DEPOSIT', 'Deposit'),
        ('WITHDRAWAL', 'Withdrawal'),
        ('PAYMENT', 'Payment'),
        ('TRANSFER', 'Transfer'),
        ('AIRTIME', 'Airtime Purchase'),
        ('FULIZA', 'Fuliza Credit'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mpesa_transactions')
    
    # Transaction details
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    transaction_category = models.CharField(max_length=20, choices=TRANSACTION_CATEGORIES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=15)
    counterparty = models.CharField(max_length=100, blank=True, null=True)  # Who they transacted with
    
    # M-Pesa reference numbers
    mpesa_receipt_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    merchant_request_id = models.CharField(max_length=50, blank=True, null=True)
    checkout_request_id = models.CharField(max_length=50, blank=True, null=True)
    
    # Transaction metadata
    transaction_date = models.DateTimeField()
    description = models.TextField(blank=True, null=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Analysis flags
    analyzed = models.BooleanField(default=False)
    is_recurring = models.BooleanField(default=False)
    is_business = models.BooleanField(default=False)
    
    # Raw data
    transaction_data = models.JSONField(default=dict)  # Store raw transaction data
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['mpesa_receipt_number']),
            models.Index(fields=['phone_number', 'transaction_date']),
            models.Index(fields=['user', 'analyzed']),
        ]
        verbose_name = 'M-Pesa Transaction'
        verbose_name_plural = 'M-Pesa Transactions'
    
    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.phone_number}"

class MpesaProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mpesa_profile')
    
    # Financial metrics
    average_weekly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    average_weekly_expenses = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    transaction_consistency = models.DecimalField(max_digits=5, decimal_places=2, null=True)  # 0-1 score
    has_savings_habit = models.BooleanField(default=False)
    network_diversity = models.IntegerField(default=0)  # Number of unique contacts
    fuliza_repayment_ratio = models.DecimalField(max_digits=5, decimal_places=2, null=True)  # 0-1 ratio
    
    # Additional metrics
    total_transactions = models.IntegerField(default=0)
    total_volume = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    active_days = models.IntegerField(default=0)  # Days with transactions
    avg_transaction_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    
    # Risk indicators
    has_negative_balance = models.BooleanField(default=False)
    late_night_transactions = models.IntegerField(default=0)  # Transactions between 10PM-5AM
    
    # Analysis metadata
    last_analysis = models.DateTimeField(null=True)
    analysis_version = models.CharField(max_length=10, default='v1')
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, null=True)  # 0-1 confidence in analysis
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"M-Pesa Profile - {self.user.phone_number}"

class MpesaPaymentRequest(models.Model):
    """
    Track STK Push payment requests for loan repayments
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_requests')
    
    # Payment details
    phone_number = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    account_reference = models.CharField(max_length=50)  # Usually user ID or loan ID
    transaction_desc = models.CharField(max_length=100, default='Loan Repayment')
    
    # M-Pesa references
    checkout_request_id = models.CharField(max_length=100, unique=True)
    merchant_request_id = models.CharField(max_length=100)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    response_code = models.CharField(max_length=10, blank=True, null=True)
    response_description = models.TextField(blank=True, null=True)
    customer_message = models.TextField(blank=True, null=True)
    
    # Callback data
    callback_data = models.JSONField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    callback_received_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['checkout_request_id']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"STK Push - {self.phone_number} - {self.amount} - {self.status}"

class MpesaWebhookLog(models.Model):
    """
    Log all M-Pesa webhook calls for debugging and audit
    """
    WEBHOOK_TYPES = [
        ('C2B', 'Customer to Business'),
        ('B2C', 'Business to Customer'),
        ('STK_PUSH', 'STK Push Callback'),
        ('BALANCE', 'Balance Check'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    webhook_type = models.CharField(max_length=20, choices=WEBHOOK_TYPES)
    payload = models.JSONField()
    headers = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Response
    response_sent = models.JSONField(null=True, blank=True)
    response_status = models.IntegerField(default=200)
    
    # Processing info
    processed = models.BooleanField(default=False)
    processing_error = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'M-Pesa Webhook Log'
        verbose_name_plural = 'M-Pesa Webhook Logs'
    
    def __str__(self):
        return f"{self.webhook_type} Webhook - {self.created_at}"