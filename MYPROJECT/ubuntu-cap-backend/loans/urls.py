from django.urls import path
from . import views

urlpatterns = [
    # Loan applications
    path('applications/submit/', views.submit_loan_application, name='submit-loan-application'),
    
    # Loans
    path('my-loans/', views.get_user_loans, name='user-loans'),
    path('my-loans/<uuid:loan_id>/', views.get_loan_details, name='loan-detail'),
    
    # Repayments
    path('repayments/process/', views.process_repayment, name='process-repayment'),
    
    # Admin endpoints
    path('admin/disburse/', views.disburse_loan, name='disburse-loan'),
    path('admin/check-overdue/', views.check_overdue_loans, name='check-overdue-loans'),
]