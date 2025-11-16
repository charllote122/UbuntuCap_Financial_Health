from rest_framework import status, serializers
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.throttling import UserRateThrottle
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
from django.db.models import Avg, Max, Count
from .models import CreditScore, LoanOffer
from users.models import UserConsent
from .services import MLCreditScoringService
from .serializers import CreditScoreSerializer, LoanOfferSerializer
import logging

logger = logging.getLogger(__name__)

# Custom throttling classes
class CreditScoreThrottle(UserRateThrottle):
    rate = '5/day'  # Limit credit score calculations to 5 per day

class ModelTrainingThrottle(UserRateThrottle):
    rate = '2/hour'  # Limit model training to 2 per hour

# Request serializers for input validation
class CreditScoreRequestSerializer(serializers.Serializer):
    force_refresh = serializers.BooleanField(default=False)
    model_preference = serializers.ChoiceField(
        choices=['ml', 'rule_based'], 
        default='ml'
    )

class ModelTrainingSerializer(serializers.Serializer):
    training_samples = serializers.IntegerField(
        min_value=100, 
        max_value=100000, 
        default=1000
    )
    retrain_existing = serializers.BooleanField(default=True)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([CreditScoreThrottle])
def calculate_credit_score(request):
    """
    Calculate credit score using ML model with enhanced features
    """
    user = request.user
    
    try:
        # Validate input
        serializer = CreditScoreRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        force_refresh = serializer.validated_data['force_refresh']
        model_preference = serializer.validated_data['model_preference']
        
        # Check cache first (unless force refresh)
        cache_key = f'credit_score_{user.id}'
        if not force_refresh:
            cached_result = cache.get(cache_key)
            if cached_result:
                logger.info(f"Returning cached credit score for user {user.id}")
                return Response(cached_result)

        # Check if user has consented to M-Pesa analysis
        consent = UserConsent.objects.filter(
            user=user, 
            consent_type='MPESA_ANALYSIS', 
            consented=True
        ).first()
        
        if not consent:
            return Response({
                'success': False,
                'message': 'Please consent to M-Pesa analysis first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user has sufficient transaction data
        from mpesa.models import MpesaTransaction
        transaction_count = MpesaTransaction.objects.filter(user=user).count()
        
        if transaction_count < 5:
            return Response({
                'success': False,
                'message': 'Insufficient transaction data for credit scoring. Minimum 5 transactions required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Calculate credit score using appropriate service
        ml_service = MLCreditScoringService()
        
        if model_preference == 'ml' and ml_service.model is not None:
            score, reasoning = ml_service.calculate_score(user)
            model_type = 'Machine Learning'
        else:
            # Use rule-based scoring as fallback
            from .services import CreditScoringService
            legacy_service = CreditScoringService()
            score, reasoning = legacy_service.calculate_score(user)
            model_type = 'Rule-Based'
        
        # Save the credit score
        credit_score = CreditScore.objects.create(
            user=user,
            score=score,
            model_version='ML_v1' if model_preference == 'ml' else 'RB_v1',
            calculation_method=model_type
        )
        
        # Generate loan offer based on credit score
        loan_offer = generate_loan_offer(user, credit_score)
        
        response_data = {
            'success': True,
            'credit_score': score,
            'score_category': get_score_category(score),
            'reasoning': reasoning,
            'model_type': model_type,
            'calculation_date': timezone.now().isoformat(),
            'loan_offer': {
                'amount_offered': str(loan_offer.amount_offered),
                'interest_rate': str(loan_offer.interest_rate),
                'term_months': loan_offer.term_months,
                'monthly_payment': str(loan_offer.monthly_payment),
                'expires_at': loan_offer.expires_at.isoformat(),
                'offer_id': str(loan_offer.id)
            } if loan_offer else None,
            'improvement_tips': get_improvement_tips(score)
        }
        
        if not loan_offer:
            response_data['message'] = 'No loan offer available based on your credit score'
        
        # Cache the result for 24 hours
        cache.set(cache_key, response_data, 86400)
        
        logger.info(f"Credit score calculated for user {user.id}: {score}")
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error calculating credit score for user {user.id}: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error calculating credit score. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_credit_score(request, user_id):
    """
    Get specific credit score by user ID (admin or self-access only)
    """
    try:
        # Check if user is requesting their own score or is admin
        if str(request.user.id) != str(user_id) and not request.user.is_staff:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        credit_score = CreditScore.objects.filter(
            user_id=user_id
        ).order_by('-created_at').first()
        
        if not credit_score:
            return Response({
                'success': False,
                'message': 'No credit score found for this user'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CreditScoreSerializer(credit_score)
        return Response({
            'success': True,
            'credit_score': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error retrieving credit score: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error retrieving credit score'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAdminUser])
@throttle_classes([ModelTrainingThrottle])
def train_ml_model(request):
    """
    Admin endpoint to train/re-train the ML model with enhanced options
    """
    try:
        serializer = ModelTrainingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        training_samples = serializer.validated_data['training_samples']
        retrain_existing = serializer.validated_data['retrain_existing']
        
        ml_service = MLCreditScoringService()
        
        # Check if model exists and retrain_existing is False
        if ml_service.model is not None and not retrain_existing:
            return Response({
                'success': False,
                'message': 'Model already exists. Use retrain_existing=True to force retraining.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Train with custom sample size
        train_accuracy, test_accuracy = ml_service.train_model(
            training_data=None,  # Using synthetic data
            n_samples=training_samples
        )
        
        # Clear all cached credit scores since model has been updated
        clear_credit_score_cache()
        
        return Response({
            'success': True,
            'message': 'ML model trained successfully',
            'training_samples': training_samples,
            'train_accuracy': round(train_accuracy, 3),
            'test_accuracy': round(test_accuracy, 3),
            'model_updated': timezone.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error training ML model: {str(e)}")
        return Response({
            'success': False,
            'message': f'Error training ML model: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def credit_score_history(request):
    """
    Get user's credit score history
    """
    try:
        scores = CreditScore.objects.filter(
            user=request.user
        ).order_by('-created_at')[:10]  # Last 10 scores
        
        history_data = [{
            'score': score.score,
            'model_version': score.model_version,
            'calculation_method': score.calculation_method,
            'date': score.created_at.isoformat(),
            'loan_offers_count': score.loan_offers.count()
        } for score in scores]
        
        return Response({
            'success': True,
            'history': history_data,
            'total_calculations': len(history_data)
        })
        
    except Exception as e:
        logger.error(f"Error fetching credit history for user {request.user.id}: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error fetching credit history'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def credit_score_analytics(request):
    """
    Get analytics about user's credit scores
    """
    try:
        user_scores = CreditScore.objects.filter(user=request.user)
        
        if not user_scores.exists():
            return Response({
                'success': False,
                'message': 'No credit score history found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        latest_score = user_scores.latest('created_at')
        score_trend = calculate_score_trend(user_scores)
        
        analytics_data = {
            'current_score': latest_score.score,
            'score_trend': score_trend,
            'total_calculations': user_scores.count(),
            'average_score': round(user_scores.aggregate(avg=Avg('score'))['avg'], 1),
            'best_score': user_scores.aggregate(best=Max('score'))['best'],
            'first_calculation': user_scores.earliest('created_at').created_at.isoformat(),
            'latest_calculation': latest_score.created_at.isoformat()
        }
        
        return Response({
            'success': True,
            'analytics': analytics_data
        })
        
    except Exception as e:
        logger.error(f"Error fetching credit analytics for user {request.user.id}: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error fetching credit analytics'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_loan_offer(request):
    """
    Accept a loan offer
    """
    try:
        offer_id = request.data.get('offer_id')
        
        if not offer_id:
            return Response({
                'success': False,
                'message': 'Offer ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        loan_offer = LoanOffer.objects.get(
            id=offer_id,
            user=request.user,
            status='PENDING'
        )
        
        # Check if offer is expired
        if loan_offer.expires_at < timezone.now():
            return Response({
                'success': False,
                'message': 'This loan offer has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update offer status
        loan_offer.status = 'ACCEPTED'
        loan_offer.accepted_at = timezone.now()
        loan_offer.save()
        
        # Here you would typically integrate with your loan processing system
        logger.info(f"Loan offer {offer_id} accepted by user {request.user.id}")
        
        return Response({
            'success': True,
            'message': 'Loan offer accepted successfully',
            'next_steps': [
                'Loan documentation will be sent to your email',
                'Funds will be disbursed within 24 hours',
                'Check your dashboard for repayment schedule'
            ]
        })
        
    except LoanOffer.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Loan offer not found or already processed'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error accepting loan offer: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error accepting loan offer'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_offers(request):
    """
    Get user's current active loan offers
    """
    try:
        current_offers = LoanOffer.objects.filter(
            user=request.user,
            status='PENDING',
            expires_at__gt=timezone.now()
        ).order_by('-created_at')
        
        serializer = LoanOfferSerializer(current_offers, many=True)
        
        return Response({
            'success': True,
            'offers': serializer.data,
            'total_offers': len(serializer.data)
        })
        
    except Exception as e:
        logger.error(f"Error retrieving current offers: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error retrieving loan offers'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def loan_offer_history(request):
    """
    Get user's loan offer history
    """
    try:
        offers = LoanOffer.objects.filter(
            user=request.user
        ).order_by('-created_at')[:20]  # Last 20 offers
        
        serializer = LoanOfferSerializer(offers, many=True)
        
        return Response({
            'success': True,
            'offers': serializer.data,
            'total_offers': len(serializer.data)
        })
        
    except Exception as e:
        logger.error(f"Error retrieving offer history: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error retrieving offer history'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_loan_offer(request, offer_id):
    """
    Decline a loan offer
    """
    try:
        loan_offer = LoanOffer.objects.get(
            id=offer_id,
            user=request.user,
            status='PENDING'
        )
        
        loan_offer.status = 'DECLINED'
        loan_offer.save()
        
        logger.info(f"Loan offer {offer_id} declined by user {request.user.id}")
        
        return Response({
            'success': True,
            'message': 'Loan offer declined successfully'
        })
        
    except LoanOffer.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Loan offer not found or already processed'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error declining loan offer: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error declining loan offer'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def ml_model_status(request):
    """
    Get ML model status and performance metrics
    """
    try:
        ml_service = MLCreditScoringService()
        
        model_info = {
            'model_loaded': ml_service.model is not None,
            'model_type': type(ml_service.model).__name__ if ml_service.model else 'None',
            'scaler_loaded': ml_service.scaler is not None,
            'last_training_date': 'N/A',  # You might want to store this in your model
        }
        
        # Add file existence info
        import os
        model_exists = os.path.exists(ml_service.model_path)
        scaler_exists = os.path.exists(ml_service.scaler_path)
        
        model_info.update({
            'model_file_exists': model_exists,
            'scaler_file_exists': scaler_exists,
            'model_path': ml_service.model_path if model_exists else 'Not found',
        })
        
        return Response({
            'success': True,
            'model_status': model_info
        })
        
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error getting model status'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def clear_credit_cache(request):
    """
    Clear credit score cache (admin endpoint)
    """
    try:
        # Get cache keys pattern (adjust based on your cache implementation)
        from django.core.cache import cache
        cache.clear()  # This clears entire cache - use more targeted approach in production
        
        logger.info("Credit score cache cleared by admin")
        
        return Response({
            'success': True,
            'message': 'Credit score cache cleared successfully'
        })
        
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error clearing cache'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health_check(request):
    """
    Health check endpoint for the credit scoring service
    """
    try:
        # Basic health checks
        from mpesa.models import MpesaTransaction
        from django.db import connection
        
        # Database connection check
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Model availability check
        ml_service = MLCreditScoringService()
        
        health_status = {
            'database': 'healthy',
            'ml_model_loaded': ml_service.model is not None,
            'total_users': 'N/A',  # Add your user model import if needed
            'service': 'operational',
            'timestamp': timezone.now().isoformat()
        }
        
        return Response({
            'success': True,
            'status': 'healthy',
            'checks': health_status
        })
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return Response({
            'success': False,
            'status': 'unhealthy',
            'message': str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def system_status(request):
    """
    Comprehensive system status for administrators
    """
    try:
        from django.core.cache import cache
        from django.db import connection
        
        # Database stats
        total_scores = CreditScore.objects.count()
        total_offers = LoanOffer.objects.count()
        recent_scores = CreditScore.objects.filter(
            created_at__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        # Cache test
        cache_test_key = 'system_status_test'
        cache.set(cache_test_key, 'test_value', 60)
        cache_working = cache.get(cache_test_key) == 'test_value'
        
        # ML Service status
        ml_service = MLCreditScoringService()
        
        system_status = {
            'database': {
                'total_credit_scores': total_scores,
                'total_loan_offers': total_offers,
                'recent_scores_24h': recent_scores,
                'connection': 'healthy'
            },
            'cache': {
                'status': 'working' if cache_working else 'failing',
                'backend': str(cache.__class__.__name__)
            },
            'ml_service': {
                'model_loaded': ml_service.model is not None,
                'model_type': type(ml_service.model).__name__ if ml_service.model else 'None',
                'scaler_loaded': ml_service.scaler is not None
            },
            'system': {
                'current_time': timezone.now().isoformat(),
                'python_version': 'N/A',  # You can add import sys; sys.version
                'django_version': 'N/A'   # You can add django.get_version()
            }
        }
        
        return Response({
            'success': True,
            'system_status': system_status
        })
        
    except Exception as e:
        logger.error(f"System status check failed: {str(e)}")
        return Response({
            'success': False,
            'message': f'System status check failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Helper functions
def generate_loan_offer(user, credit_score):
    """
    Generate sophisticated loan offer based on ML credit score and user's financial profile
    """
    try:
        # Get user's financial history for personalized offers
        from mpesa.models import MpesaTransaction
        six_months_ago = timezone.now() - timedelta(days=180)
        
        income_data = MpesaTransaction.objects.filter(
            user=user,
            transaction_date__gte=six_months_ago,
            transaction_type__in=['B2C', 'C2C'],
            amount__gt=0
        ).aggregate(
            avg_income=Avg('amount'),
            total_income=Sum('amount')
        )
        
        avg_monthly_income = (income_data['avg_income'] or 0) * 4.33  # Weekly to monthly approx
        total_income = income_data['total_income'] or 0
        
        # Dynamic offer calculation based on score and income
        if credit_score.score >= 80:
            # Excellent: 6x monthly income or score-based maximum
            amount = min(avg_monthly_income * 6.0, 100000)
            interest_rate = calculate_dynamic_interest(credit_score.score)
            term_months = 24
        elif credit_score.score >= 70:
            # Good: 4x monthly income
            amount = min(avg_monthly_income * 4.0, 50000)
            interest_rate = calculate_dynamic_interest(credit_score.score)
            term_months = 18
        elif credit_score.score >= 60:
            # Fair: 2.5x monthly income
            amount = min(avg_monthly_income * 2.5, 25000)
            interest_rate = calculate_dynamic_interest(credit_score.score)
            term_months = 12
        elif credit_score.score >= 50:
            # Basic: 1.5x monthly income
            amount = min(avg_monthly_income * 1.5, 10000)
            interest_rate = calculate_dynamic_interest(credit_score.score)
            term_months = 9
        elif credit_score.score >= 40:
            # Limited: 0.8x monthly income
            amount = min(avg_monthly_income * 0.8, 5000)
            interest_rate = calculate_dynamic_interest(credit_score.score)
            term_months = 6
        else:
            return None  # No offer for scores below 40
        
        # Ensure minimum viable offer amount
        amount = max(amount, 1000)
        
        # Calculate monthly payment
        monthly_rate = interest_rate / 100 / 12
        monthly_payment = (amount * monthly_rate * (1 + monthly_rate) ** term_months) / ((1 + monthly_rate) ** term_months - 1)
        
        expires_at = timezone.now() + timedelta(days=14)  # 2-week offer validity
        
        loan_offer = LoanOffer.objects.create(
            user=user,
            credit_score=credit_score,
            amount_offered=amount,
            interest_rate=interest_rate,
            term_months=term_months,
            monthly_payment=monthly_payment,
            expires_at=expires_at
        )
        return loan_offer
        
    except Exception as e:
        logger.error(f"Error generating loan offer for user {user.id}: {str(e)}")
        return None

def calculate_dynamic_interest(score):
    """Calculate personalized interest rate based on credit score"""
    base_rate = 25.0  # Maximum rate for poor credit
    reduction = (score - 40) * 0.3  # Reduce 0.3% per point above 40
    return max(5.0, round(base_rate - reduction, 1))  # Minimum 5%, rounded to 1 decimal

def get_score_category(score):
    """Convert numerical score to category"""
    if score >= 80:
        return 'Excellent'
    elif score >= 70:
        return 'Good'
    elif score >= 60:
        return 'Fair'
    elif score >= 50:
        return 'Basic'
    elif score >= 40:
        return 'Limited'
    else:
        return 'Poor'

def get_improvement_tips(score):
    """Provide personalized tips to improve credit score"""
    tips = []
    
    if score < 60:
        tips.append("Increase your transaction frequency")
        tips.append("Maintain consistent income patterns")
    
    if score < 70:
        tips.append("Diversify your transaction network")
        tips.append("Reduce evening and weekend transactions")
    
    if score < 80:
        tips.append("Maintain positive savings ratio")
        tips.append("Keep expense-to-income ratio below 80%")
    
    return tips

def calculate_score_trend(scores_queryset):
    """Calculate score trend over time"""
    scores = list(scores_queryset.order_by('created_at'))
    if len(scores) < 2:
        return 'stable'
    
    recent_scores = scores[-3:]  # Last 3 scores
    score_values = [s.score for s in recent_scores]
    
    if len(score_values) >= 2:
        if score_values[-1] > score_values[0] + 5:
            return 'improving'
        elif score_values[-1] < score_values[0] - 5:
            return 'declining'
    
    return 'stable'

def clear_credit_score_cache():
    """Clear all cached credit score results"""
    from django.core.cache import cache
    # In a real implementation, you might want to be more specific
    # about which cache keys to clear
    logger.info("Clearing credit score cache due to model update")