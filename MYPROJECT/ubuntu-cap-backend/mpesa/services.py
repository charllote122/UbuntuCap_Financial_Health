import requests
import json
import logging
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from .models import MpesaTransaction, MpesaProfile, MpesaPaymentRequest
import africastalking
from decimal import Decimal

logger = logging.getLogger(__name__)

class MpesaService:
    """
    Service for handling M-Pesa API interactions
    """
    
    def __init__(self):
        # Initialize Africa's Talking
        africastalking.initialize(
            username=settings.AFRICASTALKING_USERNAME,
            api_key=settings.AFRICASTALKING_API_KEY
        )
        self.sms = africastalking.SMS
        self.payments = africastalking.PaymentService
    
    def simulate_mpesa_data(self, user, months=6):
        """
        Simulate M-Pesa transaction data for development
        """
        try:
            transactions = []
            base_date = timezone.now() - timedelta(days=30*months)
            
            # Generate realistic transaction patterns
            for i in range(100):  # Generate 100 transactions
                transaction_date = base_date + timedelta(
                    days=i % 90,
                    hours=(i * 13) % 24,
                    minutes=(i * 37) % 60
                )
                
                # Different transaction types
                if i % 10 == 0:
                    # Salary/income
                    amount = Decimal('25000.00')
                    transaction_type = 'C2B'
                    category = 'DEPOSIT'
                    counterparty = 'EMPLOYER_CO'
                elif i % 7 == 0:
                    # Bill payment
                    amount = Decimal('1500.00')
                    transaction_type = 'C2B'
                    category = 'PAYMENT'
                    counterparty = 'KPLC'
                elif i % 5 == 0:
                    # Send money
                    amount = Decimal('2000.00')
                    transaction_type = 'C2C'
                    category = 'TRANSFER'
                    counterparty = 'FRIEND'
                else:
                    # General expenses
                    amount = Decimal('500.00') + Decimal(str((i * 17) % 1000))
                    transaction_type = 'C2B'
                    category = 'PAYMENT'
                    counterparty = 'MERCHANT'
                
                transaction = MpesaTransaction(
                    user=user,
                    transaction_type=transaction_type,
                    transaction_category=category,
                    amount=amount,
                    phone_number=user.phone_number,
                    counterparty=counterparty,
                    transaction_date=transaction_date,
                    description=f"Simulated transaction {i}",
                    analyzed=True
                )
                transactions.append(transaction)
            
            # Bulk create transactions
            MpesaTransaction.objects.bulk_create(transactions)
            
            logger.info(f"Simulated {len(transactions)} M-Pesa transactions for {user.phone_number}")
            return len(transactions)
            
        except Exception as e:
            logger.error(f"Error simulating M-Pesa data: {str(e)}")
            return 0
    
    def analyze_transactions(self, user):
        """
        Analyze M-Pesa transactions to generate financial profile
        """
        try:
            transactions = MpesaTransaction.objects.filter(
                user=user,
                transaction_date__gte=timezone.now() - timedelta(days=90)  # Last 3 months
            )
            
            if not transactions.exists():
                return None
            
            # Calculate financial metrics
            total_income = Decimal('0')
            total_expenses = Decimal('0')
            transaction_counts = {}
            unique_contacts = set()
            fuliza_data = {'borrowed': Decimal('0'), 'repaid': Decimal('0')}
            
            for transaction in transactions:
                # Categorize as income or expense
                if transaction.transaction_type in ['C2B'] and transaction.amount > 1000:
                    total_income += transaction.amount
                else:
                    total_expenses += transaction.amount
                
                # Track unique contacts
                if transaction.counterparty:
                    unique_contacts.add(transaction.counterparty)
                
                # Analyze Fuliza usage (simplified)
                if 'FULIZA' in transaction.description.upper():
                    if transaction.amount > 0:
                        fuliza_data['borrowed'] += transaction.amount
                    else:
                        fuliza_data['repaid'] += abs(transaction.amount)
            
            # Calculate metrics
            weekly_income = total_income / 13  # Approximate weeks in 3 months
            weekly_expenses = total_expenses / 13
            
            # Transaction consistency (simple standard deviation approximation)
            transaction_days = transactions.dates('transaction_date', 'day')
            active_days = len(transaction_days)
            total_days = 90
            consistency_score = Decimal(str(active_days / total_days))
            
            # Fuliza repayment ratio
            fuliza_ratio = None
            if fuliza_data['borrowed'] > 0:
                fuliza_ratio = fuliza_data['repaid'] / fuliza_data['borrowed']
            
            # Network diversity
            network_diversity = len(unique_contacts)
            
            # Savings habit (simple heuristic)
            has_savings = weekly_income > weekly_expenses * Decimal('1.1')  # Income > Expenses by 10%
            
            # Create or update M-Pesa profile
            profile, created = MpesaProfile.objects.get_or_create(user=user)
            profile.average_weekly_income = weekly_income
            profile.average_weekly_expenses = weekly_expenses
            profile.transaction_consistency = consistency_score
            profile.has_savings_habit = has_savings
            profile.network_diversity = network_diversity
            profile.fuliza_repayment_ratio = fuliza_ratio
            profile.total_transactions = transactions.count()
            profile.total_volume = total_income + total_expenses
            profile.active_days = active_days
            profile.avg_transaction_amount = (total_income + total_expenses) / transactions.count()
            profile.last_analysis = timezone.now()
            profile.save()
            
            logger.info(f"Completed M-Pesa analysis for {user.phone_number}")
            return profile
            
        except Exception as e:
            logger.error(f"Error analyzing M-Pesa transactions: {str(e)}")
            return None

class STKPushService:
    """
    Service for handling M-Pesa STK Push payments
    """
    
    def initiate_stk_push(self, phone_number, amount, account_reference, description="Loan Repayment"):
        """
        Initiate STK Push payment request
        """
        try:
            # Format phone number (ensure it starts with 254)
            if phone_number.startswith('0'):
                phone_number = '254' + phone_number[1:]
            elif phone_number.startswith('+'):
                phone_number = phone_number[1:]
            
            # Using Africa's Talking API for STK Push
            payments = africastalking.PaymentService
            response = payments.mobile_checkout(
                product_name="UbuntuCap",
                phone_number=phone_number,
                currency_code="KES",
                amount=float(amount),
                metadata={
                    "account_reference": account_reference,
                    "description": description
                }
            )
            
            logger.info(f"STK Push initiated for {phone_number}: {response}")
            return response
            
        except Exception as e:
            logger.error(f"Error initiating STK Push: {str(e)}")
            return None
    
    def handle_stk_callback(self, callback_data):
        """
        Handle STK Push callback from Africa's Talking
        """
        try:
            # Extract relevant data from callback
            checkout_request_id = callback_data.get('checkoutRequestID')
            result_code = callback_data.get('status')
            result_description = callback_data.get('description')
            
            # Find the payment request
            payment_request = MpesaPaymentRequest.objects.get(
                checkout_request_id=checkout_request_id
            )
            
            # Update payment request status
            if result_code == 'Success':
                payment_request.status = 'COMPLETED'
                payment_request.response_code = '0'
            else:
                payment_request.status = 'FAILED'
                payment_request.response_code = result_code
            
            payment_request.response_description = result_description
            payment_request.callback_data = callback_data
            payment_request.callback_received_at = timezone.now()
            payment_request.save()
            
            logger.info(f"Processed STK callback for {checkout_request_id}: {result_code}")
            return payment_request
            
        except MpesaPaymentRequest.DoesNotExist:
            logger.error(f"Payment request not found for checkout ID: {checkout_request_id}")
            return None
        except Exception as e:
            logger.error(f"Error handling STK callback: {str(e)}")
            return None