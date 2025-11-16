from rest_framework import serializers
from .models import CreditScore, LoanOffer

class CreditScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditScore
        fields = ['id', 'user', 'score', 'model_version', 'calculated_at']

class LoanOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanOffer
        fields = ['id', 'user', 'credit_score', 'amount_offered', 'interest_rate', 'status', 'created_at', 'expires_at']