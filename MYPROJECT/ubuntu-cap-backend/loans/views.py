from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Loan, Repayment, LoanApplication
from .services import LoanService, LoanApplicationService
from users.models import User
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_loan_application(request):
    """
    Submit a new loan application
    """
    amount = request.data.get('amount')
    term_days = request.data.get('term_days', 30)
    purpose = request.data.get('purpose', '')
    
    user = request.user
    
    if not user.is_verified:
        return Response({
            'success': False,
            'message': 'User must be verified to apply for a loan'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        application, message = LoanApplicationService.submit_application(
            user, amount, term_days, purpose
        )
        
        if application:
            return Response({
                'success': True,
                'message': message,
                'application_id': str(application.id)
            })
        else:
            return Response({
                'success': False,
                'message': message
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error submitting loan application: {str(e)}")
        return Response({
            'success': False,
            'message': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_loans(request):
    """
    Get all loans for the authenticated user
    """
    user = request.user
    loans = Loan.objects.filter(user=user).order_by('-created_at')
    
    loans_data = []
    for loan in loans:
        loans_data.append({
            'id': str(loan.id),
            'principal_amount': str(loan.principal_amount),
            'interest_rate': str(loan.interest_rate),
            'total_amount_due': str(loan.total_amount_due),
            'status': loan.status,
            'disbursed_at': loan.disbursed_at,
            'due_date': loan.due_date,
            'days_remaining': loan.days_remaining,
            'is_overdue': loan.is_overdue
        })
    
    return Response({
        'success': True,
        'loans': loans_data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_loan_details(request, loan_id):
    """
    Get detailed information about a specific loan
    """
    try:
        loan = Loan.objects.get(id=loan_id, user=request.user)
        repayments = loan.repayments.filter(status='COMPLETED')
        
        total_repaid = sum(rep.amount for rep in repayments)
        balance = loan.total_amount_due - total_repaid
        
        repayment_history = []
        for repayment in repayments:
            repayment_history.append({
                'amount': str(repayment.amount),
                'paid_at': repayment.paid_at,
                'payment_method': repayment.payment_method
            })
        
        return Response({
            'success': True,
            'loan': {
                'id': str(loan.id),
                'principal_amount': str(loan.principal_amount),
                'interest_rate': str(loan.interest_rate),
                'total_amount_due': str(loan.total_amount_due),
                'amount_disbursed': str(loan.amount_disbursed),
                'status': loan.status,
                'disbursed_at': loan.disbursed_at,
                'due_date': loan.due_date,
                'days_remaining': loan.days_remaining,
                'is_overdue': loan.is_overdue
            },
            'repayment_summary': {
                'total_repaid': str(total_repaid),
                'remaining_balance': str(balance),
                'is_fully_repaid': loan.status == 'PAID'
            },
            'repayment_history': repayment_history
        })
        
    except Loan.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Loan not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_repayment(request):
    """
    Process a loan repayment
    """
    loan_id = request.data.get('loan_id')
    amount = request.data.get('amount')
    mpesa_transaction_id = request.data.get('mpesa_transaction_id')
    
    try:
        # Verify the loan belongs to the user
        loan = Loan.objects.get(id=loan_id, user=request.user)
        
        repayment = LoanService.process_repayment(loan_id, amount, mpesa_transaction_id)
        
        return Response({
            'success': True,
            'message': 'Repayment processed successfully',
            'repayment_id': str(repayment.id),
            'amount_paid': str(repayment.amount),
            'loan_status': repayment.loan.status
        })
        
    except Loan.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Loan not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error processing repayment: {str(e)}")
        return Response({
            'success': False,
            'message': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Admin endpoints (keep separate permissions if needed)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disburse_loan(request):
    """
    Disburse an approved loan (Admin function)
    """
    # Add admin permission check
    if not request.user.is_staff:
        return Response({
            'success': False,
            'message': 'Permission denied'
        }, status=status.HTTP_403_FORBIDDEN)
    
    loan_id = request.data.get('loan_id')
    
    try:
        loan = LoanService.disburse_loan(loan_id)
        
        return Response({
            'success': True,
            'message': 'Loan disbursed successfully',
            'loan_id': str(loan.id),
            'amount_disbursed': str(loan.amount_disbursed),
            'disbursed_at': loan.disbursed_at
        })
        
    except ValueError as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error disbursing loan: {str(e)}")
        return Response({
            'success': False,
            'message': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_overdue_loans(request):
    """
    Admin endpoint to check and update overdue loans
    """
    # Add admin permission check
    if not request.user.is_staff:
        return Response({
            'success': False,
            'message': 'Permission denied'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        overdue_count = LoanService.check_overdue_loans()
        
        return Response({
            'success': True,
            'message': f'Updated {overdue_count} loans to overdue status'
        })
        
    except Exception as e:
        logger.error(f"Error checking overdue loans: {str(e)}")
        return Response({
            'success': False,
            'message': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)