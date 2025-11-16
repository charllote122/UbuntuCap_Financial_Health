from django.utils import timezone
from datetime import timedelta
from .models import Loan, Repayment, LoanApplication
from users.models import User
from credit_scoring.models import CreditScore
import logging

logger = logging.getLogger(__name__)

class LoanService:
    """
    Service class for loan operations
    """
    
    @staticmethod
    def create_loan_from_offer(user, loan_offer):
        """
        Create a loan from an accepted loan offer
        """
        try:
            loan = Loan.objects.create(
                user=user,
                loan_offer=loan_offer,
                principal_amount=loan_offer.amount_offered,
                interest_rate=loan_offer.interest_rate,
                term_days=30,  # Default 30-day term
                status='APPROVED'
            )
            
            logger.info(f"Loan created from offer: {loan.id} for user: {user.phone_number}")
            return loan
            
        except Exception as e:
            logger.error(f"Error creating loan from offer: {str(e)}")
            raise
    
    @staticmethod
    def disburse_loan(loan_id):
        """
        Disburse a loan (send money to user via M-Pesa)
        """
        try:
            loan = Loan.objects.get(id=loan_id)
            
            if loan.status != 'APPROVED':
                raise ValueError("Loan must be approved before disbursement")
            
            # TODO: Integrate with M-Pesa B2C API here
            # For now, we'll simulate successful disbursement
            
            loan.amount_disbursed = loan.principal_amount
            loan.status = 'DISBURSED'
            loan.disbursed_at = timezone.now()
            loan.save()
            
            # Update loan offer status if exists
            if loan.loan_offer:
                loan.loan_offer.status = 'ACCEPTED'
                loan.loan_offer.save()
            
            logger.info(f"Loan disbursed: {loan.id}")
            return loan
            
        except Loan.DoesNotExist:
            raise ValueError("Loan not found")
        except Exception as e:
            logger.error(f"Error disbursing loan {loan_id}: {str(e)}")
            raise
    
    @staticmethod
    def process_repayment(loan_id, amount, mpesa_transaction_id=None):
        """
        Process a loan repayment
        """
        try:
            loan = Loan.objects.get(id=loan_id)
            
            # Create repayment record
            repayment = Repayment.objects.create(
                loan=loan,
                amount=amount,
                status='COMPLETED',
                mpesa_transaction_id=mpesa_transaction_id,
                paid_at=timezone.now()
            )
            
            # Update loan status if fully repaid
            total_repaid = sum(rep.amount for rep in loan.repayments.filter(status='COMPLETED'))
            
            if total_repaid >= loan.total_amount_due:
                loan.status = 'PAID'
                loan.repaid_at = timezone.now()
                loan.save()
                logger.info(f"Loan fully repaid: {loan.id}")
            else:
                loan.status = 'ACTIVE'
                loan.save()
                logger.info(f"Partial repayment received for loan: {loan.id}")
            
            return repayment
            
        except Loan.DoesNotExist:
            raise ValueError("Loan not found")
        except Exception as e:
            logger.error(f"Error processing repayment for loan {loan_id}: {str(e)}")
            raise
    
    @staticmethod
    def check_overdue_loans():
        """
        Check and update status of overdue loans
        """
        try:
            active_loans = Loan.objects.filter(status__in=['DISBURSED', 'ACTIVE'])
            overdue_count = 0
            
            for loan in active_loans:
                if loan.is_overdue:
                    loan.status = 'OVERDUE'
                    loan.save()
                    overdue_count += 1
            
            logger.info(f"Updated {overdue_count} loans to overdue status")
            return overdue_count
            
        except Exception as e:
            logger.error(f"Error checking overdue loans: {str(e)}")
            raise

class LoanApplicationService:
    """
    Service class for loan application operations
    """
    
    @staticmethod
    def submit_application(user, amount, term_days=30, purpose=""):
        """
        Submit a new loan application
        """
        try:
            # Check if user has a recent credit score
            credit_score = CreditScore.objects.filter(user=user).order_by('-calculated_at').first()
            
            if not credit_score:
                return None, "No credit score available. Please complete your profile first."
            
            application = LoanApplication.objects.create(
                user=user,
                requested_amount=amount,
                requested_term=term_days,
                purpose=purpose
            )
            
            logger.info(f"Loan application submitted: {application.id}")
            return application, "Application submitted successfully"
            
        except Exception as e:
            logger.error(f"Error submitting loan application: {str(e)}")
            raise
    
    @staticmethod
    def auto_review_application(application_id):
        """
        Automatically review loan application based on credit score
        """
        try:
            application = LoanApplication.objects.get(id=application_id)
            credit_score = CreditScore.objects.filter(user=application.user).order_by('-calculated_at').first()
            
            if not credit_score:
                application.status = 'REJECTED'
                application.rejection_reason = "No credit score available"
                application.save()
                return application
            
            # Simple auto-approval logic based on credit score
            if credit_score.score >= 60 and application.requested_amount <= 5000:
                application.status = 'APPROVED'
                application.rejection_reason = ""
            else:
                application.status = 'REJECTED'
                application.rejection_reason = "Credit score or amount does not meet requirements"
            
            application.reviewed_at = timezone.now()
            application.save()
            
            logger.info(f"Application {application_id} auto-reviewed: {application.status}")
            return application
            
        except LoanApplication.DoesNotExist:
            raise ValueError("Application not found")
        except Exception as e:
            logger.error(f"Error auto-reviewing application {application_id}: {str(e)}")
            raise