from django.urls import path
from . import views

urlpatterns = [
    # Transaction management
    path('simulate-transactions/', views.simulate_transactions, name='simulate-transactions'),
    path('analyze-transactions/', views.analyze_transactions, name='analyze-transactions'),
    path('transaction-history/', views.get_transaction_history, name='transaction-history'),
    path('profile/', views.get_mpesa_profile, name='mpesa-profile'),
    
    # Payment processing
    path('initiate-repayment/', views.initiate_loan_repayment, name='initiate-repayment'),
    
    # Webhooks (public endpoints)
    path('stk-callback/', views.stk_callback, name='stk-callback'),
]