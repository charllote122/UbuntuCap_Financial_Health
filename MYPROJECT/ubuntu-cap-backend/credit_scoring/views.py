from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import CreditScore, LoanOffer
from users.models import User
from .services import CreditScoringService

@api_view(['POST'])
def calculate_credit_score(request):
    """
    Calculate credit score for a user (triggered after M-Pesa data collection)
    """
    user_id = request.data.get('user_id')
    
    try:
        user = User.objects.get(id=user_id)
        
        # Check if user has consented to M-Pesa analysis
        from users.models import UserConsent
        consent = UserConsent.objects.filter(user=user, consented=True).first()
        
        if not consent:
            return Response({
                'success': False,
                'message': 'User has not consented to M-Pesa analysis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate credit score using our service
        scoring_service = CreditScoringService()
        score, reasoning = scoring_service.calculate_score(user)
        
        # Save the credit score
        credit_score = CreditScore.objects.create(
            user=user,
            score=score,
            model_version='v1'
        )
        
        # Generate loan offer based on score
        loan_offer = generate_loan_offer(user, credit_score)
        
        return Response({
            'success': True,
            'credit_score': score,
            'reasoning': reasoning,
            'loan_offer': {
                'amount_offered': str(loan_offer.amount_offered),
                'interest_rate': str(loan_offer.interest_rate),
                'offer_id': str(loan_offer.id)
            }
        })
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_credit_score(request, user_id):
    """
    Get the latest credit score for a user
    """
    try:
        user = User.objects.get(id=user_id)
        credit_score = CreditScore.objects.filter(user=user).first()
        
        if not credit_score:
            return Response({
                'success': False,
                'message': 'No credit score found for user'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': True,
            'credit_score': credit_score.score,
            'calculated_at': credit_score.calculated_at,
            'model_version': credit_score.model_version
        })
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def accept_loan_offer(request):
    """
    User accepts a loan offer
    """
    offer_id = request.data.get('offer_id')
    
    try:
        loan_offer = LoanOffer.objects.get(id=offer_id, status='PENDING')
        
        # Check if offer is still valid
        if loan_offer.expires_at < timezone.now():
            loan_offer.status = 'EXPIRED'
            loan_offer.save()
            return Response({
                'success': False,
                'message': 'Loan offer has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        loan_offer.status = 'ACCEPTED'
        loan_offer.save()
        
        # TODO: Trigger loan disbursement process
        return Response({
            'success': True,
            'message': 'Loan offer accepted successfully',
            'next_step': 'Loan disbursement will be processed shortly'
        })
        
    except LoanOffer.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Loan offer not found or already processed'
        }, status=status.HTTP_404_NOT_FOUND)

def generate_loan_offer(user, credit_score):
    """
    Generate loan offer based on credit score
    """
    # Define loan tiers based on credit score
    if credit_score.score >= 80:
        amount = 5000.00
        interest_rate = 7.0  # 7% APR
    elif credit_score.score >= 60:
        amount = 3000.00
        interest_rate = 10.0  # 10% APR
    elif credit_score.score >= 40:
        amount = 1000.00
        interest_rate = 15.0  # 15% APR
    else:
        amount = 0.00
        interest_rate = 0.0
    
    if amount > 0:
        expires_at = timezone.now() + timedelta(days=7)  # Offer valid for 7 days
        
        loan_offer = LoanOffer.objects.create(
            user=user,
            credit_score=credit_score,
            amount_offered=amount,
            interest_rate=interest_rate,
            expires_at=expires_at
        )
        return loan_offer
    else:
        return None