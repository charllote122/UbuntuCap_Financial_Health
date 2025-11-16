import random
from django.utils import timezone
from datetime import timedelta
from mpesa.models import MpesaTransaction

class CreditScoringService:
    """
    Service to calculate credit scores based on M-Pesa transaction data
    """
    
    def calculate_score(self, user):
        """
        Calculate credit score for a user based on their M-Pesa transactions
        For now, this uses simulated data. Replace with real analysis later.
        """
        # Get user's M-Pesa transactions (simulated for now)
        transactions = MpesaTransaction.objects.filter(user=user)
        
        if not transactions.exists():
            # If no transactions, return a random score for demo
            return self._simulate_score(), "Based on initial assessment"
        
        # TODO: Implement real scoring logic here
        # For now, we'll simulate based on transaction patterns
        score = self._analyze_transactions(transactions)
        reasoning = self._generate_reasoning(score)
        
        return score, reasoning
    
    def _analyze_transactions(self, transactions):
        """
        Analyze transaction patterns to generate a score
        This is a simplified version for demo purposes
        """
        base_score = 50  # Start with a neutral score
        
        # Simulate analysis factors
        transaction_count = transactions.count()
        recent_transactions = transactions.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        )
        
        # Adjust score based on transaction activity
        if recent_transactions.count() > 20:
            base_score += 20  # Active user
        elif recent_transactions.count() > 10:
            base_score += 10
        elif recent_transactions.count() > 5:
            base_score += 5
        
        # Add some randomness for demo (replace with real logic)
        variation = random.randint(-10, 10)
        final_score = base_score + variation
        
        # Ensure score is within 1-100 range
        return max(1, min(100, final_score))
    
    def _simulate_score(self):
        """Generate a simulated score for users without transaction data"""
        return random.randint(30, 80)
    
    def _generate_reasoning(self, score):
        """Generate reasoning based on score"""
        if score >= 80:
            return "Excellent financial health with consistent transaction patterns"
        elif score >= 60:
            return "Good financial behavior with regular transaction activity"
        elif score >= 40:
            return "Average financial patterns, room for improvement"
        else:
            return "Limited transaction history detected"