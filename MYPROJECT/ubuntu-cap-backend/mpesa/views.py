from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from .models import MpesaTransaction, MpesaProfile, MpesaPaymentRequest, MpesaWebhookLog
from .services import MpesaService, STKPushService
from users.models import User
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simulate_transactions(request):
    """
    Simulate M-Pesa transactions for development and testing
    """
    months = request.data.get('months', 6)
    
    try:
        mpesa_service = MpesaService()
        transaction_count = mpesa_service.simulate_mpesa_data(request.user, months)
        
        if transaction_count > 0:
            # Analyze the simulated data
            profile = mpesa_service.analyze_transactions(request.user)
            
            return Response({
                'success': True,
                'message': f'Successfully simulated {transaction_count} transactions',
                'transactions_created': transaction_count,
                'profile_analyzed': profile is not None
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to simulate transactions'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error simulating transactions: {str(e)}")
        return Response({
            'success': False,
            'message': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_transactions(request):
    """
    Analyze user's M-Pesa transactions and generate financial profile
    """
    try:
        mpesa_service = MpesaService()
        profile = mpesa_service.analyze_transactions(request.user)
        
        if profile:
            return Response({
                'success': True,
                'message': 'Transaction analysis completed',
                'profile': {
                    'average_weekly_income': str(profile.average_weekly_income),
                    'average_weekly_expenses': str(profile.average_weekly_expenses),
                    'transaction_consistency': str(profile.transaction_consistency),
                    'has_savings_habit': profile.has_savings_habit,
                    'network_diversity': profile.network_diversity,
                    'fuliza_repayment_ratio': str(profile.fuliza_repayment_ratio) if profile.fuliza_repayment_ratio else None,
                    'total_transactions': profile.total_transactions,
                    'active_days': profile.active_days,
                    'last_analysis': profile.last_analysis
                }
            })
        else:
            return Response({
                'success': False,
                'message': 'No transactions found for analysis'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        logger.error(f"Error analyzing transactions: {str(e)}")
        return Response({
            'success': False,
            'message': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_loan_repayment(request):
    """
    Initiate STK Push for loan repayment
    """
    amount = request.data.get('amount')
    phone_number = request.data.get('phone_number', request.user.phone_number)
    
    if not amount:
        return Response({
            'success': False,
            'message': 'Amount is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        stk_service = STKPushService()
        
        # Create payment request record
        payment_request = MpesaPaymentRequest.objects.create(
            user=request.user,
            phone_number=phone_number,
            amount=amount,
            account_reference=str(request.user.id),
            transaction_desc='Loan Repayment'
        )
        
        # Initiate STK Push
        response = stk_service.initiate_stk_push(
            phone_number=phone_number,
            amount=amount,
            account_reference=str(request.user.id),
            description='Loan Repayment - UbuntuCap'
        )
        
        if response and 'CheckoutRequestID' in response:
            payment_request.checkout_request_id = response['CheckoutRequestID']
            payment_request.merchant_request_id = response.get('MerchantRequestID', '')
            payment_request.customer_message = response.get('CustomerMessage', '')
            payment_request.save()
            
            return Response({
                'success': True,
                'message': 'Payment request sent to your phone',
                'checkout_request_id': response['CheckoutRequestID'],
                'customer_message': response.get('CustomerMessage', '')
            })
        else:
            payment_request.status = 'FAILED'
            payment_request.response_description = 'Failed to initiate STK Push'
            payment_request.save()
            
            return Response({
                'success': False,
                'message': 'Failed to initiate payment. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error initiating loan repayment: {str(e)}")
        return Response({
            'success': False,
            'message': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def stk_callback(request):
    """
    Handle STK Push callback from Africa's Talking
    """
    try:
        callback_data = request.data
        
        # Log the webhook call
        webhook_log = MpesaWebhookLog.objects.create(
            webhook_type='STK_PUSH',
            payload=callback_data,
            headers=dict(request.headers),
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Process the callback
        stk_service = STKPushService()
        payment_request = stk_service.handle_stk_callback(callback_data)
        
        if payment_request:
            webhook_log.processed = True
            webhook_log.processed_at = timezone.now()
            webhook_log.response_sent = {'status': 'processed'}
            webhook_log.save()
            
            # TODO: Trigger loan repayment processing
            if payment_request.status == 'COMPLETED':
                logger.info(f"Loan repayment completed for user {payment_request.user.phone_number}")
            
            return Response({
                "ResultCode": 0,
                "ResultDesc": "Callback processed successfully"
            })
        else:
            webhook_log.processed = True
            webhook_log.processing_error = "Payment request not found"
            webhook_log.response_status = 404
            webhook_log.save()
            
            return Response({
                "ResultCode": 1,
                "ResultDesc": "Payment request not found"
            }, status=404)
            
    except Exception as e:
        logger.error(f"Error processing STK callback: {str(e)}")
        return Response({
            "ResultCode": 1,
            "ResultDesc": "Error processing callback"
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transaction_history(request):
    """
    Get user's M-Pesa transaction history
    """
    try:
        transactions = MpesaTransaction.objects.filter(user=request.user).order_by('-transaction_date')[:50]
        
        transaction_data = []
        for transaction in transactions:
            transaction_data.append({
                'id': str(transaction.id),
                'amount': str(transaction.amount),
                'type': transaction.transaction_type,
                'category': transaction.transaction_category,
                'counterparty': transaction.counterparty,
                'description': transaction.description,
                'transaction_date': transaction.transaction_date,
                'receipt_number': transaction.mpesa_receipt_number
            })
        
        return Response({
            'success': True,
            'transactions': transaction_data,
            'total_count': len(transaction_data)
        })
        
    except Exception as e:
        logger.error(f"Error fetching transaction history: {str(e)}")
        return Response({
            'success': False,
            'message': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mpesa_profile(request):
    """
    Get user's M-Pesa financial profile
    """
    try:
        profile, created = MpesaProfile.objects.get_or_create(user=request.user)
        
        return Response({
            'success': True,
            'profile': {
                'average_weekly_income': str(profile.average_weekly_income) if profile.average_weekly_income else None,
                'average_weekly_expenses': str(profile.average_weekly_expenses) if profile.average_weekly_expenses else None,
                'transaction_consistency': str(profile.transaction_consistency) if profile.transaction_consistency else None,
                'has_savings_habit': profile.has_savings_habit,
                'network_diversity': profile.network_diversity,
                'fuliza_repayment_ratio': str(profile.fuliza_repayment_ratio) if profile.fuliza_repayment_ratio else None,
                'total_transactions': profile.total_transactions,
                'total_volume': str(profile.total_volume),
                'active_days': profile.active_days,
                'last_analysis': profile.last_analysis
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching M-Pesa profile: {str(e)}")
        return Response({
            'success': False,
            'message': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)