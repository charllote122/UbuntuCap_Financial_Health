from django.urls import path
from . import views

urlpatterns = [
    # Credit Score Calculation & Retrieval
    path('calculate-score/', views.calculate_credit_score, name='calculate-credit-score'),
    path('scores/history/', views.credit_score_history, name='credit-score-history'),
    path('scores/analytics/', views.credit_score_analytics, name='credit-score-analytics'),
    path('score/<uuid:user_id>/', views.get_credit_score, name='get-credit-score'),
    
    # Loan Offers Management
    path('offers/accept/', views.accept_loan_offer, name='accept-loan-offer'),
    path('offers/current/', views.get_current_offers, name='get-current-offers'),
    path('offers/history/', views.loan_offer_history, name='loan-offer-history'),
    path('offers/<uuid:offer_id>/decline/', views.decline_loan_offer, name='decline-loan-offer'),
    
    # ML Model Management (Admin endpoints)
    path('admin/train-model/', views.train_ml_model, name='train-ml-model'),
    path('admin/model-status/', views.ml_model_status, name='ml-model-status'),
    path('admin/clear-cache/', views.clear_credit_cache, name='clear-credit-cache'),
    
    # Health Check & System Status
    path('health/', views.health_check, name='health-check'),
    path('system-status/', views.system_status, name='system-status'),
]