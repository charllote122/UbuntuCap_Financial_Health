from django.db import models
from users.models import User
from credit_scoring.models import LoanOffer

class Loan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    loan_offer = models.ForeignKey(LoanOffer, on_delete=models.CASCADE)
    amount_disbursed = models.DecimalField(max_digits=10, decimal_places=2)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING_DISBURSEMENT', 'Pending Disbursement'),
            ('DISBURSED', 'Disbursed'),
            ('ACTIVE', 'Active'),
            ('PAID', 'Paid'),
            ('DEFAULTED', 'Defaulted')
        ],
        default='PENDING_DISBURSEMENT'
    )
    disbursed_at = models.DateTimeField(null=True)
    due_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

class Repayment(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, default='MPESA')
    transaction_id = models.CharField(max_length=100, unique=True)
    paid_at = models.DateTimeField(auto_now_add=True)