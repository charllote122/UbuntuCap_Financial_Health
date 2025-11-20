// Utility Functions
class Utils {
    static getCSRFToken() {
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    static showAlert(message, type = 'success') {
        console.log(`🔔 Alert [${type}]:`, message);

        // Remove any existing alerts first
        const existingAlerts = document.querySelectorAll('.custom-alert');
        existingAlerts.forEach(alert => {
            if (alert.parentNode) {
                alert.remove();
            }
        });

        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert alert-${type}`;
        alertDiv.textContent = message;

        // Add inline styles for guaranteed positioning
        alertDiv.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            z-index: 10000 !important;
            padding: 1rem 1.5rem !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
            font-size: 0.95rem !important;
            max-width: 400px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
            animation: slideInRight 0.4s ease-out !important;
            backdrop-filter: blur(10px) !important;
            border: none !important;
            display: flex !important;
            align-items: center !important;
            gap: 0.75rem !important;
        `;

        // Add type-specific styles
        const typeStyles = {
            success: `
                background: linear-gradient(135deg, #d4edda, #c3e6cb) !important;
                color: #155724 !important;
                border-left: 4px solid #28a745 !important;
            `,
            error: `
                background: linear-gradient(135deg, #f8d7da, #f5c6cb) !important;
                color: #721c24 !important;
                border-left: 4px solid #dc3545 !important;
            `,
            warning: `
                background: linear-gradient(135deg, #fff3cd, #ffeaa7) !important;
                color: #856404 !important;
                border-left: 4px solid #ffc107 !important;
            `,
            info: `
                background: linear-gradient(135deg, #d1ecf1, #bee5eb) !important;
                color: #0c5460 !important;
                border-left: 4px solid #17a2b8 !important;
            `
        };

        alertDiv.style.cssText += typeStyles[type] || typeStyles.success;

        // Add emoji based on type
        const emojis = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        alertDiv.innerHTML = `${emojis[type] || '💡'} ${message}`;

        // Add to body
        document.body.appendChild(alertDiv);

        // Add animation styles if not already present
        if (!document.querySelector('#alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Auto remove after 5 seconds with smooth animation
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.remove();
                    }
                }, 300);
            }
        }, 5000);

        return alertDiv;
    }

    static showLoading(message = 'Loading...') {
        // Remove any existing loading indicators
        this.hideLoading();

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'global-loading';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div style="color: #333; font-weight: 600; font-size: 1.1rem;">${message}</div>
            </div>
        `;

        // Add spin animation if not present
        if (!document.querySelector('#loading-animations')) {
            const style = document.createElement('style');
            style.id = 'loading-animations';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(loadingDiv);
        return loadingDiv;
    }

    static hideLoading() {
        const loadingDiv = document.getElementById('global-loading');
        if (loadingDiv && loadingDiv.parentNode) {
            loadingDiv.remove();
        }
    }

    static setButtonLoading(button, isLoading, loadingText = 'Loading...') {
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.setAttribute('data-original-text', button.innerHTML);
            button.innerHTML = `
                <span style="display: inline-flex; align-items: center; gap: 8px;">
                    <div style="
                        width: 16px;
                        height: 16px;
                        border: 2px solid transparent;
                        border-top: 2px solid currentColor;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    ${loadingText}
                </span>
            `;
            button.style.opacity = '0.7';
            button.style.cursor = 'not-allowed';
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
            }
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    }

    static formatCurrency(amount) {
        if (amount === null || amount === undefined) return 'KES 0.00';

        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    static formatDate(dateString, options = {}) {
        if (!dateString) return 'N/A';

        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return new Date(dateString).toLocaleDateString('en-KE', { ...defaultOptions, ...options });
    }

    static formatDateTime(dateString) {
        if (!dateString) return 'N/A';

        return new Date(dateString).toLocaleString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static validatePhoneNumber(phone) {
        if (!phone) return false;

        // Remove any spaces and special characters
        const cleaned = phone.toString().replace(/\s+/g, '').replace(/[^\d+]/g, '');

        // Kenyan phone number regex: +254XXXXXXXXX or 0XXXXXXXXX
        const regex = /^(\+254|0)?[17]\d{8}$/;

        // Convert 0XXXXXXXXX to +254XXXXXXXXX for consistency
        if (regex.test(cleaned)) {
            if (cleaned.startsWith('0')) {
                return '+254' + cleaned.substring(1);
            }
            return cleaned;
        }

        return false;
    }

    static validateEmail(email) {
        if (!email) return false;

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.trim());
    }

    static validatePassword(password) {
        if (!password) return false;

        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    static validateIDNumber(idNumber) {
        if (!idNumber) return false;

        // Kenyan ID number validation (basic format)
        const regex = /^\d{1,8}$/;
        return regex.test(idNumber.toString().trim());
    }

    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        return input
            .trim()
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    static copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    resolve();
                } catch (err) {
                    reject(err);
                }
                document.body.removeChild(textArea);
            }
        });
    }

    static generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static isOnline() {
        return navigator.onLine;
    }

    static addOnlineListener(callback) {
        window.addEventListener('online', callback);
        window.addEventListener('offline', callback);
    }

    static removeOnlineListener(callback) {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
    }

    static storage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Storage set error:', error);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Storage get error:', error);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Storage remove error:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Storage clear error:', error);
                return false;
            }
        }
    };

    static session = {
        set(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Session storage set error:', error);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Session storage get error:', error);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Session storage remove error:', error);
                return false;
            }
        },

        clear() {
            try {
                sessionStorage.clear();
                return true;
            } catch (error) {
                console.error('Session storage clear error:', error);
                return false;
            }
        }
    };
}

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000/api',
    ENDPOINTS: {
        AUTH: {
            REGISTER: '/users/register/',
            LOGIN: '/users/login/',
            LOGOUT: '/users/logout/',
            VERIFY_PHONE: '/users/verify-phone/',
            PASSWORD_RESET: '/users/password-reset/',
            PASSWORD_RESET_CONFIRM: '/users/password-reset-confirm/'
        },
        PROFILE: {
            GET: '/users/profile/',
            UPDATE: '/users/profile/update/',
            CONSENT: '/users/consent/'
        },
        DASHBOARD: '/users/dashboard/',
        LOANS: {
            APPLICATIONS: {
                SUBMIT: '/loans/applications/submit/',
                LIST: '/loans/applications/'
            },
            USER_LOANS: '/loans/my-loans/',
            LOAN_DETAIL: '/loans/my-loans/',
            REPAYMENT: '/loans/repayments/process/'
        },
        MPESA: {
            PROFILE: '/mpesa/profile/',
            TRANSACTION_HISTORY: '/mpesa/transaction-history/',
            ANALYZE_TRANSACTIONS: '/mpesa/analyze-transactions/',
            SIMULATE_TRANSACTIONS: '/mpesa/simulate-transactions/',
            INITIATE_REPAYMENT: '/mpesa/initiate-repayment/'
        },
        CREDIT_SCORING: {
            CALCULATE_SCORE: '/credit/calculate-score/',
            SCORE_HISTORY: '/credit/scores/history/',
            SCORE_ANALYTICS: '/credit/scores/analytics/',
            CURRENT_OFFERS: '/credit/offers/current/',
            OFFER_HISTORY: '/credit/offers/history/',
            ACCEPT_OFFER: '/credit/offers/accept/',
            DECLINE_OFFER: '/credit/offers/'
        }
    }
};

// State Management
class AppState {
    constructor() {
        this.user = null;
        this.token = localStorage.getItem('authToken');
        this.isAuthenticated = !!this.token;

        // Load user data from storage if exists
        const userData = Utils.storage.get('userData');
        if (userData) {
            this.user = userData;
        }
    }

    setUser(user) {
        this.user = user;
        this.isAuthenticated = true;
        Utils.storage.set('userData', user);

        // Dispatch custom event for auth state change
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isAuthenticated: true, user }
        }));
    }

    clearUser() {
        this.user = null;
        this.isAuthenticated = false;
        this.token = null;
        Utils.storage.remove('authToken');
        Utils.storage.remove('userData');

        // Dispatch custom event for auth state change
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isAuthenticated: false, user: null }
        }));
    }

    setToken(token) {
        this.token = token;
        Utils.storage.set('authToken', token);
    }

    // Helper methods
    getUser() {
        return this.user;
    }

    getUserId() {
        return this.user?.id;
    }

    getUserName() {
        return this.user ? `${this.user.first_name} ${this.user.last_name}` : 'Guest';
    }

    hasPermission(permission) {
        return this.user?.permissions?.includes(permission) || false;
    }

    isProfileComplete() {
        return this.user?.profile_complete || false;
    }
}

// Create global state instance
window.appState = new AppState();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils, API_CONFIG, AppState };
}