import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum, Avg, StdDev, Q
import joblib
import os
from django.conf import settings
import logging
import random
from mpesa.models import MpesaTransaction, MpesaProfile

logger = logging.getLogger(__name__)

class MLCreditScoringService:
    """
    Machine Learning powered credit scoring service
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = os.path.join(settings.BASE_DIR, 'credit_scoring', 'ml_models', 'credit_model.pkl')
        self.scaler_path = os.path.join(settings.BASE_DIR, 'credit_scoring', 'ml_models', 'scaler.pkl')
        self.load_model()
    
    def load_model(self):
        """Load trained ML model and scaler"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                logger.info("ML model loaded successfully")
            else:
                logger.warning("No trained model found. Using default scoring.")
        except Exception as e:
            logger.error(f"Error loading ML model: {str(e)}")
    
    def train_model(self, training_data=None):
        """
        Train the credit scoring model
        In production, you'd use historical data with known outcomes
        """
        try:
            # For demo, we'll create synthetic training data
            # In reality, you'd use your historical loan performance data
            if training_data is None:
                X, y = self._generate_training_data()
            else:
                X, y = training_data
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model (using Gradient Boosting for better performance)
            self.model = GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            )
            
            self.model.fit(X_train_scaled, y_train)
            
            # Save model and scaler
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            
            # Calculate training accuracy
            train_accuracy = self.model.score(X_train_scaled, y_train)
            test_accuracy = self.model.score(X_test_scaled, y_test)
            
            logger.info(f"Model trained - Train Accuracy: {train_accuracy:.3f}, Test Accuracy: {test_accuracy:.3f}")
            
            return train_accuracy, test_accuracy
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            return 0, 0
    
    def calculate_score(self, user):
        """
        Calculate credit score using ML model
        """
        try:
            # Extract features from user's transaction data
            features = self._extract_features(user)
            
            if features is None:
                return self._fallback_score(user), "Insufficient data for ML analysis"
            
            # Convert to numpy array and scale
            features_array = np.array([list(features.values())])
            features_scaled = self.scaler.transform(features_array)
            
            # Predict probability of good credit
            if self.model:
                probability_good = self.model.predict_proba(features_scaled)[0][1]
                ml_score = int(probability_good * 100)
                
                # Get feature importance for reasoning
                reasoning = self._generate_ml_reasoning(features, self.model.feature_importances_)
                
                return ml_score, reasoning
            else:
                # Fallback to rule-based scoring if no ML model
                return self._rule_based_score(features), "Using rule-based scoring (ML model not available)"
                
        except Exception as e:
            logger.error(f"Error in ML credit scoring: {str(e)}")
            return self._fallback_score(user), "Error in analysis, using fallback scoring"
    
    def _extract_features(self, user):
        """
        Extract features from user's M-Pesa transaction data
        """
        try:
            # Get transactions from last 6 months
            six_months_ago = timezone.now() - timedelta(days=180)
            transactions = MpesaTransaction.objects.filter(
                user=user,
                transaction_date__gte=six_months_ago
            )
            
            if transactions.count() < 10:  # Minimum transactions for reliable analysis
                return None
            
            # Basic transaction metrics
            total_transactions = transactions.count()
            total_volume = transactions.aggregate(total=Sum('amount'))['total'] or 0
            
            # Income vs Expense analysis
            income_transactions = transactions.filter(
                Q(transaction_type='B2C') | 
                Q(transaction_type='C2C', amount__gt=0)
            )
            total_income = income_transactions.aggregate(total=Sum('amount'))['total'] or 0
            
            expense_transactions = transactions.filter(
                Q(transaction_type='C2B') |
                Q(transaction_type='C2C', amount__lt=0)
            )
            total_expenses = abs(expense_transactions.aggregate(total=Sum('amount'))['total'] or 0)
            
            # Transaction patterns
            transaction_dates = transactions.values_list('transaction_date', flat=True)
            if transaction_dates:
                dates_series = pd.Series(transaction_dates)
                active_days = dates_series.dt.date.nunique()
                transaction_frequency = total_transactions / active_days if active_days > 0 else 0
            else:
                active_days = 0
                transaction_frequency = 0
            
            # Network diversity
            unique_counterparties = transactions.values('counterparty').distinct().count()
            
            # Consistency metrics (standard deviation of transaction amounts)
            amount_std = transactions.aggregate(std=StdDev('amount'))['std'] or 0
            
            # Time-based features
            evening_transactions = transactions.filter(
                transaction_date__hour__gte=18
            ).count()
            weekend_transactions = transactions.filter(
                transaction_date__week_day__in=[1, 7]  # Saturday and Sunday
            ).count()
            
            # Financial health indicators
            savings_ratio = (total_income - total_expenses) / total_income if total_income > 0 else 0
            expense_to_income_ratio = total_expenses / total_income if total_income > 0 else 1
            
            features = {
                'total_transactions': total_transactions,
                'total_volume': float(total_volume),
                'total_income': float(total_income),
                'total_expenses': float(total_expenses),
                'active_days': active_days,
                'transaction_frequency': transaction_frequency,
                'unique_counterparties': unique_counterparties,
                'amount_std': float(amount_std),
                'evening_transactions_ratio': evening_transactions / total_transactions,
                'weekend_transactions_ratio': weekend_transactions / total_transactions,
                'savings_ratio': savings_ratio,
                'expense_to_income_ratio': expense_to_income_ratio,
                'avg_transaction_amount': float(total_volume / total_transactions),
            }
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting features: {str(e)}")
            return None
    
    def _generate_training_data(self, n_samples=1000):
        """
        Generate synthetic training data for demo purposes
        In production, replace with real historical data
        """
        np.random.seed(42)
        
        # Feature names matching _extract_features
        feature_names = [
            'total_transactions', 'total_volume', 'total_income', 'total_expenses',
            'active_days', 'transaction_frequency', 'unique_counterparties',
            'amount_std', 'evening_transactions_ratio', 'weekend_transactions_ratio',
            'savings_ratio', 'expense_to_income_ratio', 'avg_transaction_amount'
        ]
        
        X = np.zeros((n_samples, len(feature_names)))
        y = np.zeros(n_samples)
        
        for i in range(n_samples):
            # Good credit users (60% of samples)
            if i < n_samples * 0.6:
                # Good credit patterns
                X[i, 0] = np.random.normal(150, 30)  # More transactions
                X[i, 1] = np.random.normal(500000, 100000)  # Higher volume
                X[i, 2] = np.random.normal(300000, 50000)   # Higher income
                X[i, 3] = np.random.normal(200000, 40000)   # Moderate expenses
                X[i, 4] = np.random.normal(120, 20)         # Many active days
                X[i, 5] = np.random.normal(1.5, 0.3)        # Good frequency
                X[i, 6] = np.random.normal(25, 5)           # Diverse network
                X[i, 7] = np.random.normal(5000, 1000)      # Moderate std
                X[i, 8] = np.random.normal(0.1, 0.05)       # Low evening transactions
                X[i, 9] = np.random.normal(0.15, 0.05)      # Low weekend transactions
                X[i, 10] = np.random.normal(0.3, 0.1)       # Good savings ratio
                X[i, 11] = np.random.normal(0.6, 0.1)       # Healthy expense ratio
                X[i, 12] = np.random.normal(3500, 500)      # Good avg transaction
                y[i] = 1  # Good credit
            else:
                # Poor credit users
                X[i, 0] = np.random.normal(30, 10)          # Fewer transactions
                X[i, 1] = np.random.normal(50000, 20000)    # Lower volume
                X[i, 2] = np.random.normal(80000, 20000)    # Lower income
                X[i, 3] = np.random.normal(90000, 30000)    # High expenses
                X[i, 4] = np.random.normal(30, 10)          # Few active days
                X[i, 5] = np.random.normal(0.8, 0.2)        # Poor frequency
                X[i, 6] = np.random.normal(8, 3)            # Limited network
                X[i, 7] = np.random.normal(15000, 5000)     # High std (volatile)
                X[i, 8] = np.random.normal(0.4, 0.1)        # High evening transactions
                X[i, 9] = np.random.normal(0.5, 0.1)        # High weekend transactions
                X[i, 10] = np.random.normal(-0.2, 0.1)      # Negative savings
                X[i, 11] = np.random.normal(1.2, 0.2)       # High expense ratio
                X[i, 12] = np.random.normal(1500, 500)      # Low avg transaction
                y[i] = 0  # Poor credit
        
        return X, y
    
    def _generate_ml_reasoning(self, features, feature_importances):
        """Generate reasoning based on ML model feature importance"""
        feature_names = [
            'Transaction Count', 'Transaction Volume', 'Income Level', 'Expense Level',
            'Active Days', 'Transaction Frequency', 'Network Diversity', 
            'Spending Consistency', 'Evening Activity', 'Weekend Activity',
            'Savings Rate', 'Expense-to-Income Ratio', 'Average Transaction Size'
        ]
        
        # Get top 3 most important features for this prediction
        top_indices = np.argsort(feature_importances)[-3:][::-1]
        
        reasoning_parts = []
        for idx in top_indices:
            feature_name = feature_names[idx]
            importance = feature_importances[idx]
            value = list(features.values())[idx]
            
            if feature_name == 'Savings Rate' and value > 0.2:
                reasoning_parts.append("Strong savings habit")
            elif feature_name == 'Expense-to-Income Ratio' and value < 0.8:
                reasoning_parts.append("Healthy spending limits")
            elif feature_name == 'Transaction Frequency' and value > 1.2:
                reasoning_parts.append("Consistent transaction activity")
            elif feature_name == 'Network Diversity' and value > 15:
                reasoning_parts.append("Diverse financial network")
        
        if reasoning_parts:
            return " | ".join(reasoning_parts[:2])  # Limit to top 2 reasons
        else:
            return "Based on comprehensive financial behavior analysis"
    
    def _rule_based_score(self, features):
        """Fallback rule-based scoring"""
        score = 50  # Base score
        
        # Adjust based on features
        if features['savings_ratio'] > 0.2:
            score += 15
        elif features['savings_ratio'] < 0:
            score -= 10
        
        if features['expense_to_income_ratio'] < 0.8:
            score += 10
        elif features['expense_to_income_ratio'] > 1.1:
            score -= 15
        
        if features['transaction_frequency'] > 1.0:
            score += 10
        elif features['transaction_frequency'] < 0.5:
            score -= 5
        
        return max(1, min(100, score))
    
    def _fallback_score(self, user):
        """Final fallback if everything else fails"""
        return 50  # Neutral score


# Keep your original service for backward compatibility
class CreditScoringService:
    """
    Service to calculate credit scores based on M-Pesa transaction data
    Maintains backward compatibility with your existing code
    """
    
    def calculate_score(self, user):
        """
        Calculate credit score for a user based on their M-Pesa transactions
        For now, this uses simulated data. Replace with real analysis later.
        """
        # Try ML scoring first, fall back to simple scoring
        try:
            ml_service = MLCreditScoringService()
            score, reasoning = ml_service.calculate_score(user)
            return score, reasoning
        except Exception as e:
            logger.warning(f"ML scoring failed, using fallback: {str(e)}")
            return self._fallback_scoring(user)
    
    def _fallback_scoring(self, user):
        """Fallback to simple scoring logic"""
        # Get user's M-Pesa transactions
        transactions = MpesaTransaction.objects.filter(user=user)
        
        if not transactions.exists():
            # If no transactions, return a random score for demo
            return self._simulate_score(), "Based on initial assessment"
        
        # Simple scoring based on transaction patterns
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