from rest_framework import serializers
from .models import CreditScore, LoanOffer
from users.models import User  # Import if you need user details

class CreditScoreSerializer(serializers.ModelSerializer):
    score_category = serializers.SerializerMethodField()
    improvement_tips = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = CreditScore
        fields = [
            'id', 
            'user', 
            'user_email',
            'score', 
            'score_category',
            'model_version', 
            'calculation_method',
            'improvement_tips',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'score_category', 'improvement_tips']
    
    def get_score_category(self, obj):
        """Convert numerical score to category"""
        if obj.score >= 80:
            return 'Excellent'
        elif obj.score >= 70:
            return 'Good'
        elif obj.score >= 60:
            return 'Fair'
        elif obj.score >= 50:
            return 'Basic'
        elif obj.score >= 40:
            return 'Limited'
        else:
            return 'Poor'
    
    def get_improvement_tips(self, obj):
        """Provide personalized improvement tips"""
        tips = []
        
        if obj.score < 60:
            tips.extend([
                "Increase your transaction frequency",
                "Maintain consistent income patterns"
            ])
        
        if obj.score < 70:
            tips.extend([
                "Diversify your transaction network",
                "Reduce evening and weekend transactions"
            ])
        
        if obj.score < 80:
            tips.extend([
                "Maintain positive savings ratio",
                "Keep expense-to-income ratio below 80%"
            ])
        
        return tips[:3]  # Return top 3 tips

class LoanOfferSerializer(serializers.ModelSerializer):
    credit_score_details = CreditScoreSerializer(source='credit_score', read_only=True)
    monthly_payment = serializers.SerializerMethodField()
    total_repayment = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    
    class Meta:
        model = LoanOffer
        fields = [
            'id',
            'user',
            'credit_score',
            'credit_score_details',
            'amount_offered',
            'interest_rate',
            'term_months',
            'monthly_payment',
            'total_repayment',
            'status',
            'is_expired',
            'days_until_expiry',
            'created_at',
            'expires_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'monthly_payment', 
            'total_repayment', 'is_expired', 'days_until_expiry'
        ]
    
    def get_monthly_payment(self, obj):
        """Calculate monthly payment amount"""
        if obj.monthly_payment:
            return obj.monthly_payment
        
        # Calculate if not stored in model
        principal = float(obj.amount_offered)
        monthly_rate = float(obj.interest_rate) / 100 / 12
        term = obj.term_months
        
        if monthly_rate > 0:
            monthly_payment = (principal * monthly_rate * (1 + monthly_rate) ** term) / ((1 + monthly_rate) ** term - 1)
        else:
            monthly_payment = principal / term
        
        return round(monthly_payment, 2)
    
    def get_total_repayment(self, obj):
        """Calculate total repayment amount"""
        monthly_payment = self.get_monthly_payment(obj)
        return round(monthly_payment * obj.term_months, 2)
    
    def get_is_expired(self, obj):
        """Check if offer is expired"""
        from django.utils import timezone
        return obj.expires_at < timezone.now()
    
    def get_days_until_expiry(self, obj):
        """Calculate days until offer expiry"""
        from django.utils import timezone
        from datetime import timedelta
        
        if obj.is_expired:
            return 0
        
        delta = obj.expires_at - timezone.now()
        return delta.days
    
    def validate_amount_offered(self, value):
        """Validate loan amount"""
        if value <= 0:
            raise serializers.ValidationError("Loan amount must be positive")
        if value > 100000:  # Maximum loan amount
            raise serializers.ValidationError("Loan amount cannot exceed 100,000")
        return value
    
    def validate_interest_rate(self, value):
        """Validate interest rate"""
        if value <= 0:
            raise serializers.ValidationError("Interest rate must be positive")
        if value > 50:  # Maximum interest rate
            raise serializers.ValidationError("Interest rate cannot exceed 50%")
        return value

class LoanOfferCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating loan offers (admin use)"""
    class Meta:
        model = LoanOffer
        fields = [
            'user',
            'credit_score',
            'amount_offered',
            'interest_rate',
            'term_months',
            'expires_at'
        ]

class CreditScoreHistorySerializer(serializers.ModelSerializer):
    """Serializer for credit score history"""
    score_category = serializers.SerializerMethodField()
    loan_offers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CreditScore
        fields = [
            'id',
            'score',
            'score_category',
            'model_version',
            'calculation_method',
            'loan_offers_count',
            'created_at'
        ]
    
    def get_score_category(self, obj):
        return CreditScoreSerializer().get_score_category(obj)
    
    def get_loan_offers_count(self, obj):
        return obj.loan_offers.count()

class CreditAnalyticsSerializer(serializers.Serializer):
    """Serializer for credit analytics data"""
    current_score = serializers.IntegerField()
    score_trend = serializers.CharField()
    total_calculations = serializers.IntegerField()
    average_score = serializers.FloatField()
    best_score = serializers.IntegerField()
    first_calculation = serializers.DateTimeField()
    latest_calculation = serializers.DateTimeField()

class MLModelTrainingSerializer(serializers.Serializer):
    """Serializer for ML model training requests"""
    training_samples = serializers.IntegerField(
        min_value=100, 
        max_value=100000, 
        default=1000
    )
    retrain_existing = serializers.BooleanField(default=True)

class CreditScoreRequestSerializer(serializers.Serializer):
    """Serializer for credit score calculation requests"""
    force_refresh = serializers.BooleanField(default=False)
    model_preference = serializers.ChoiceField(
        choices=['ml', 'rule_based'], 
        default='ml'
    )

# Response serializers for consistent API responses
class CreditScoreResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    credit_score = serializers.IntegerField()
    score_category = serializers.CharField()
    reasoning = serializers.CharField()
    model_type = serializers.CharField()
    calculation_date = serializers.DateTimeField()
    loan_offer = serializers.DictField(required=False)
    improvement_tips = serializers.ListField(child=serializers.CharField())
    message = serializers.CharField(required=False)

class ErrorResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=False)
    message = serializers.CharField()
    errors = serializers.DictField(required=False)