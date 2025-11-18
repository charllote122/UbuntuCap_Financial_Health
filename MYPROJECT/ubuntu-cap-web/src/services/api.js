// src/services/api.js
import axios from 'axios';

// Axios instance configured for Django
const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// CSRF token handling for Django
const getCSRFToken = () => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === 'csrftoken=') {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return cookieValue;
};

// Add CSRF token to all mutating requests
api.interceptors.request.use((config) => {
    const methods = ['post', 'put', 'patch', 'delete'];
    if (config.method && methods.includes(config.method.toLowerCase())) {
        config.headers['X-CSRFToken'] = getCSRFToken();
    }
    return config;
});

// Response interceptor for Django error formats
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle Django error formats
            const djangoError = error.response.data;

            if (djangoError.detail) {
                error.message = djangoError.detail;
            } else if (typeof djangoError === 'object') {
                // Handle field errors: {field: ['error1', 'error2']}
                const fieldErrors = Object.entries(djangoError)
                    .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                    .join('; ');
                error.message = fieldErrors || 'Please check your input';
            }
        }
        return Promise.reject(error);
    }
);

// ========== AUTHENTICATION ENDPOINTS ==========
export const authAPI = {
    // User registration
    register: (userData) => api.post('/api/users/register/', userData),

    // User login
    login: (credentials) => api.post('/api/users/login/', credentials),

    // User logout
    logout: () => api.post('/api/users/logout/'),

    // Get user profile
    getProfile: () => api.get('/api/users/profile/'),

    // Update user profile
    updateProfile: (data) => api.put('/api/users/profile/update/', data),

    // User dashboard data
    getDashboard: () => api.get('/api/users/dashboard/'),

    // Phone verification
    verifyPhone: (data) => api.post('/api/users/verify-phone/', data),

    // Password reset
    requestPasswordReset: (email) => api.post('/api/users/password-reset/', { email }),
    confirmPasswordReset: (data) => api.post('/api/users/password-reset-confirm/', data),

    // User consent
    recordConsent: (data) => api.post('/api/users/consent/', data),
};

// ========== CREDIT SCORING ENDPOINTS ==========
export const creditAPI = {
    // Calculate credit score
    calculateScore: (data) => api.post('/api/credit/calculate-score/', data),

    // Get specific user's credit score
    getScore: (userId) => api.get(`/api/credit/score/${userId}/`),

    // Get current loan offers
    getCurrentOffers: () => api.get('/api/credit/offers/current/'),

    // Accept loan offer
    acceptLoanOffer: (data) => api.post('/api/credit/offers/accept/', data),

    // Decline loan offer
    declineLoanOffer: (offerId) => api.post(`/api/credit/offers/${offerId}/decline/`),

    // Get loan offer history
    getOfferHistory: () => api.get('/api/credit/offers/history/'),

    // Get credit score history
    getScoreHistory: () => api.get('/api/credit/scores/history/'),

    // Get credit score analytics
    getScoreAnalytics: () => api.get('/api/credit/scores/analytics/'),

    // System status
    getSystemStatus: () => api.get('/api/credit/system-status/'),

    // Health check
    healthCheck: () => api.get('/api/credit/health/'),

    // ========== ADMIN CREDIT ENDPOINTS ==========
    trainModel: () => api.post('/api/credit/admin/train-model/'),
    getModelStatus: () => api.get('/api/credit/admin/model-status/'),
    clearCache: () => api.post('/api/credit/admin/clear-cache/'),
};

// ========== LOANS ENDPOINTS ==========
export const loansAPI = {
    // Submit loan application
    submitApplication: (data) => api.post('/api/loans/applications/submit/', data),

    // Get user's loans
    getUserLoans: () => api.get('/api/loans/my-loans/'),

    // Get specific loan details
    getLoanDetails: (loanId) => api.get(`/api/loans/my-loans/${loanId}/`),

    // Process repayment
    processRepayment: (data) => api.post('/api/loans/repayments/process/', data),

    // ========== ADMIN LOAN ENDPOINTS ==========
    disburseLoan: (data) => api.post('/api/loans/admin/disburse/', data),
    checkOverdueLoans: () => api.post('/api/loans/admin/check-overdue/'),
};

// ========== MPESA ENDPOINTS ==========
export const mpesaAPI = {
    // Get M-Pesa profile
    getProfile: () => api.get('/api/mpesa/profile/'),

    // Initiate loan repayment
    initiateRepayment: (data) => api.post('/api/mpesa/initiate-repayment/', data),

    // Get transaction history
    getTransactionHistory: () => api.get('/api/mpesa/transaction-history/'),

    // Analyze transactions
    analyzeTransactions: () => api.post('/api/mpesa/analyze-transactions/'),

    // Simulate transactions (for testing)
    simulateTransactions: (data) => api.post('/api/mpesa/simulate-transactions/', data),

    // STK callback
    stkCallback: (data) => api.post('/api/mpesa/stk-callback/', data),
};

export default api;