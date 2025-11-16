from django.urls import path
from . import views

urlpatterns = [
    path('calculate-score/', views.calculate_credit_score, name='calculate-credit-score'),
    path('score/<uuid:user_id>/', views.get_credit_score, name='get-credit-score'),
    path('accept-offer/', views.accept_loan_offer, name='accept-loan-offer'),
]