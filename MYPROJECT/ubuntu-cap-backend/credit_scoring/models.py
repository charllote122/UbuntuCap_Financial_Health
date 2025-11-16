from django.db import models
from users.models import User

class CreditScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField()  # 1-100
    model_version = models.CharField(max_length=10, default='v1')
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-calculated_at']

class LoanOffer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    credit_score = models.ForeignKey(CreditScore, on_delete=models.CASCADE)
    amount_offered = models.DecimalField(max_digits=10, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)  # APR
    status = models.CharField(
        max_length=20,
        choices=[('PENDING', 'Pending'), ('ACCEPTED', 'Accepted'), ('EXPIRED', 'Expired')],
        default='PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()