from django.db import models
from users.models import User

class MpesaTransaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction_data = models.JSONField()  # Store raw transaction data
    analyzed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class MpesaProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    average_weekly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    transaction_consistency = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    has_savings_habit = models.BooleanField(default=False)
    network_diversity = models.IntegerField(default=0)
    fuliza_repayment_ratio = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    last_analysis = models.DateTimeField(null=True)