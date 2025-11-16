from django.db import models
import uuid
from django.utils import timezone
from users.models import User
from credit_scoring.models import CreditScore, LoanOffer

class Loan(models.Model):
    LOAN_STATUS = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('DISBURSED', 'Disbursed'),
        ('ACTIVE', 'Active'),
        ('OVERDUE', 'Overdue'),
        ('PAID', 'Paid'),
        ('DEFAULTED', 'Defaulted'),
        ('REJECTED', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    loan_offer = models.ForeignKey(LoanOffer, on_delete=models.CASCADE, null=True, blank=True)
    
    # Loan details - ALL WITH DEFAULTS
    principal_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    total_amount_due = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    amount_disbursed = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Loan terms
    term_days = models.IntegerField(default=30)
    disbursed_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    repaid_at = models.DateTimeField(null=True, blank=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=LOAN_STATUS, default='PENDING')
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Loan {self.id} - {self.user.phone_number} - {self.status}"
    
    def save(self, *args, **kwargs):
        # Calculate total amount due if not set
        if not self.total_amount_due and self.principal_amount and self.interest_rate:
            interest_amount = (self.principal_amount * self.interest_rate) / 100
            self.total_amount_due = self.principal_amount + interest_amount
        
        # Set due date if loan is disbursed
        if self.status == 'DISBURSED' and not self.due_date:
            self.due_date = timezone.now() + timezone.timedelta(days=self.term_days)
        
        super().save(*args, **kwargs)
    
    @property
    def days_remaining(self):
        if self.due_date and self.status in ['DISBURSED', 'ACTIVE', 'OVERDUE']:
            remaining = self.due_date - timezone.now()
            return max(0, remaining.days)
        return None
    
    @property
    def is_overdue(self):
        if self.due_date and timezone.now() > self.due_date and self.status in ['DISBURSED', 'ACTIVE']:
            return True
        return False

class Repayment(models.Model):
    PAYMENT_METHODS = [
        ('MPESA', 'M-Pesa'),
        ('BANK', 'Bank Transfer'),
        ('CASH', 'Cash'),
    ]
    
    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='repayments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='MPESA')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='PENDING')
    
    # M-Pesa specific fields
    mpesa_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    mpesa_receipt_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Timestamps
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Repayment {self.id} - {self.loan.id} - {self.amount}"

class LoanApplication(models.Model):
    APPLICATION_STATUS = [
        ('PENDING', 'Pending Review'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    requested_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    requested_term = models.IntegerField(default=30)
    
    # Application details
    purpose = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=APPLICATION_STATUS, default='PENDING')
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Review information
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Application {self.id} - {self.user.phone_number} - {self.status}"