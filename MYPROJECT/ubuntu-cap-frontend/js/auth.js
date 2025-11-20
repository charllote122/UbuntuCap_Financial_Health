// Authentication Management
class AuthManager {
    constructor() {
        this.currentView = 'login';
        this.isLoading = false;
        this.init();
    }

    async init() {
        console.log('🔄 AuthManager initializing...');
        // First, get CSRF token
        await this.getCSRFToken();
        // Check if user is already logged in
        await this.checkAuthStatus();
        this.renderAuthView();
        this.attachEventListeners();
    }

    async getCSRFToken() {
        try {
            const response = await fetch('http://127.0.0.1:8000/csrf-token/', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                console.log('✅ CSRF token received');
                return data.csrfToken;
            }
        } catch (error) {
            console.error('❌ CSRF token fetch failed:', error);
        }
        return null;
    }

    async checkAuthStatus() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROFILE.GET, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ User already authenticated:', data.user);
                window.appState.setUser(data.user);

                // User is logged in, show dashboard
                if (window.dashboardManager) {
                    window.dashboardManager.loadDashboard();
                }
                return true;
            }
        } catch (error) {
            console.log('User not authenticated:', error.message);
        }
        return false;
    }

    renderAuthView() {
        const mainContent = document.getElementById('main-content');
        // Only show auth if user is not authenticated
        if (!window.appState.isAuthenticated) {
            mainContent.innerHTML = this.getAuthHTML();
            this.attachFormEventListeners();
        }
    }

    getAuthHTML() {
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">UbuntuCap</div>
                        <p class="auth-subtitle">Financial Health Platform</p>
                    </div>
                    
                    <div class="auth-tabs">
                        <div class="auth-tab ${this.currentView === 'login' ? 'active' : ''}" data-tab="login">
                            Login
                        </div>
                        <div class="auth-tab ${this.currentView === 'register' ? 'active' : ''}" data-tab="register">
                            Register
                        </div>
                    </div>

                    ${this.currentView === 'login' ? this.getLoginForm() : this.getRegisterForm()}
                </div>
            </div>
        `;
    }

    getLoginForm() {
        return `
            <form id="login-form">
                <div class="form-group">
                    <label class="form-label" for="login-phone">Phone Number</label>
                    <input type="tel" class="form-control" id="login-phone" 
                           placeholder="+254712345678" required value="+254712345678">
                    <div class="form-error" id="login-phone-error"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="login-password">Password</label>
                    <input type="password" class="form-control" id="login-password" 
                           placeholder="Enter your password" required value="testpass123">
                    <div class="form-error" id="login-password-error"></div>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%;" id="login-submit-btn">
                    ${this.isLoading ? 'Logging in...' : 'Login'}
                </button>

                <div class="text-center" style="margin-top: 1rem;">
                    <a href="#" id="forgot-password">Forgot Password?</a>
                </div>

                <!-- Debug info -->
                <div style="margin-top: 1rem; padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
                    <strong>Debug:</strong> Using backend at ${API_CONFIG.BASE_URL}
                </div>
            </form>
        `;
    }

    getRegisterForm() {
        // Generate unique data to avoid "user already exists" errors
        const timestamp = Date.now().toString().slice(-4);
        const uniquePhone = `+2547000${timestamp}`;
        const uniqueEmail = `test${timestamp}@example.com`;
        const uniqueId = `12345${timestamp}`;

        return `
            <form id="register-form">
                <div class="form-group">
                    <label class="form-label" for="register-phone">Phone Number</label>
                    <input type="tel" class="form-control" id="register-phone" 
                           placeholder="+254712345678" required value="${uniquePhone}">
                    <div class="form-error" id="register-phone-error"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="register-first-name">First Name</label>
                    <input type="text" class="form-control" id="register-first-name" 
                           placeholder="Enter your first name" required value="John">
                    <div class="form-error" id="register-first-name-error"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="register-last-name">Last Name</label>
                    <input type="text" class="form-control" id="register-last-name" 
                           placeholder="Enter your last name" required value="Doe">
                    <div class="form-error" id="register-last-name-error"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="register-email">Email Address</label>
                    <input type="email" class="form-control" id="register-email" 
                           placeholder="Enter your email" required value="${uniqueEmail}">
                    <div class="form-error" id="register-email-error"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="register-id">ID Number</label>
                    <input type="text" class="form-control" id="register-id" 
                           placeholder="Enter your ID number" required value="${uniqueId}">
                    <div class="form-error" id="register-id-error"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="register-password">Password</label>
                    <input type="password" class="form-control" id="register-password" 
                           placeholder="Create a password" required value="testpass123">
                    <div class="form-error" id="register-password-error"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="register-password-confirm">Confirm Password</label>
                    <input type="password" class="form-control" id="register-password-confirm" 
                           placeholder="Confirm your password" required value="testpass123">
                    <div class="form-error" id="register-password-confirm-error"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="register-channel">Registration Channel</label>
                    <select class="form-control" id="register-channel" required>
                        <option value="APP">APP</option>
                        <option value="USSD">USSD</option>
                    </select>
                    <div class="form-error" id="register-channel-error"></div>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%;" id="register-submit-btn">
                    ${this.isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div style="margin-top: 1rem; padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
                    <strong>Note:</strong> Phone number auto-generates to avoid duplicates
                </div>
            </form>
        `;
    }

    attachEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.dataset.tab) {
                this.switchTab(e.target.dataset.tab);
            }
        });
    }

    attachFormEventListeners() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const forgotPassword = document.getElementById('forgot-password');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                console.log('🔵 Login form submitted');
                this.handleLogin(e);
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                console.log('🔵 Register form submitted');
                this.handleRegister(e);
            });
        }

        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => this.handleForgotPassword(e));
        }
    }

    switchTab(tab) {
        console.log(`🔄 Switching to tab: ${tab}`);
        this.currentView = tab;
        this.renderAuthView();
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('🔵 Login process started');

        const submitBtn = document.getElementById('login-submit-btn');
        if (this.isLoading) return;

        this.isLoading = true;
        Utils.setButtonLoading(submitBtn, true);

        const phone = document.getElementById('login-phone').value;
        const password = document.getElementById('login-password').value;

        // Clear previous errors
        this.clearErrors('login');

        // Validation
        if (!Utils.validatePhoneNumber(phone)) {
            this.showError('login-phone-error', 'Please enter a valid Kenyan phone number');
            this.isLoading = false;
            Utils.setButtonLoading(submitBtn, false);
            return;
        }

        try {
            console.log('🔄 Attempting login...');

            // Get fresh CSRF token
            const csrfToken = await this.getCSRFToken();

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    phone_number: phone,
                    password: password
                })
            });

            console.log('📡 Login response status:', response.status);

            const data = await response.json();
            console.log('📡 Login response data:', data);

            if (response.ok && data.success) {
                Utils.showAlert('Login successful!', 'success');
                window.appState.setUser(data.user);

                // Load dashboard
                if (window.dashboardManager) {
                    window.dashboardManager.loadDashboard();
                }
            } else {
                const errorMessage = data.errors ?
                    (typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors)) :
                    data.message || 'Login failed';
                this.showError('login-password-error', errorMessage);
                Utils.showAlert(errorMessage, 'error');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            let errorMessage = 'Network error. Please try again.';

            if (error.message.includes('Failed to fetch')) {
                errorMessage = `Cannot connect to server. Make sure:
• Django is running on http://127.0.0.1:8000
• CORS is properly configured
• Check browser console for errors`;
            }

            Utils.showAlert(errorMessage, 'error');
        } finally {
            this.isLoading = false;
            Utils.setButtonLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        console.log('🔵 Register button clicked - starting registration process');

        const submitBtn = document.getElementById('register-submit-btn');
        if (this.isLoading) return;

        this.isLoading = true;
        Utils.setButtonLoading(submitBtn, true);

        const formData = {
            phone_number: document.getElementById('register-phone').value,
            first_name: document.getElementById('register-first-name').value,
            last_name: document.getElementById('register-last-name').value,
            email: document.getElementById('register-email').value,
            id_number: document.getElementById('register-id').value,
            password: document.getElementById('register-password').value,
            password_confirm: document.getElementById('register-password-confirm').value,
            registration_channel: document.getElementById('register-channel').value
        };

        console.log('📝 Form data:', formData);

        // Clear previous errors
        this.clearErrors('register');
        console.log('🧹 Cleared previous errors');

        // Validation
        let hasErrors = false;

        if (!Utils.validatePhoneNumber(formData.phone_number)) {
            console.log('❌ Phone validation failed');
            this.showError('register-phone-error', 'Please enter a valid Kenyan phone number');
            hasErrors = true;
        }

        if (!Utils.validateEmail(formData.email)) {
            console.log('❌ Email validation failed');
            this.showError('register-email-error', 'Please enter a valid email address');
            hasErrors = true;
        }

        if (formData.password !== formData.password_confirm) {
            console.log('❌ Password confirmation failed');
            this.showError('register-password-confirm-error', 'Passwords do not match');
            hasErrors = true;
        }

        if (hasErrors) {
            this.isLoading = false;
            Utils.setButtonLoading(submitBtn, false);
            Utils.showAlert('Please fix the form errors above', 'error');
            return;
        }

        console.log('✅ All validations passed');

        try {
            console.log('🔄 Attempting registration...');

            // Get fresh CSRF token
            const csrfToken = await this.getCSRFToken();
            console.log('🔐 CSRF token:', csrfToken ? 'Received' : 'Failed');

            console.log('📡 Sending request to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.REGISTER);

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(formData)
            });

            console.log('📡 Registration response status:', response.status);

            const data = await response.json();
            console.log('📡 Registration response data:', data);

            if (response.ok && data.success) {
                console.log('✅ Registration successful');
                Utils.showAlert('Registration successful! Please verify your phone.', 'success');
                this.showVerificationStep(formData.phone_number);
            } else {
                console.log('❌ Registration failed:', data);
                // Show form errors
                if (data.errors) {
                    Object.keys(data.errors).forEach(field => {
                        const fieldName = field.replace(/_/g, '-');
                        const errorMessage = Array.isArray(data.errors[field]) ? data.errors[field][0] : data.errors[field];
                        console.log(`❌ Field error [${field}]:`, errorMessage);
                        this.showError(`register-${fieldName}-error`, errorMessage);
                    });
                    Utils.showAlert('Please fix the form errors above', 'error');
                } else {
                    const errorMsg = data.message || 'Registration failed';
                    console.log('❌ General error:', errorMsg);
                    Utils.showAlert(errorMsg, 'error');
                }
            }
        } catch (error) {
            console.error('❌ Registration network error:', error);
            Utils.showAlert('Network error. Please check console and try again.', 'error');
        } finally {
            this.isLoading = false;
            Utils.setButtonLoading(submitBtn, false);
        }
    }

    showVerificationStep(phoneNumber) {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">Verify Phone</div>
                        <p class="auth-subtitle">Enter the code sent to ${phoneNumber}</p>
                        <p style="color: #666; font-size: 14px; margin-top: 5px;">
                            For testing, check your Django console for the verification code
                        </p>
                    </div>

                    <div class="verification-step">
                        <form id="verification-form">
                            <div class="verification-code">
                                <input type="text" class="verification-input" maxlength="1" required>
                                <input type="text" class="verification-input" maxlength="1" required>
                                <input type="text" class="verification-input" maxlength="1" required>
                                <input type="text" class="verification-input" maxlength="1" required>
                                <input type="text" class="verification-input" maxlength="1" required>
                                <input type="text" class="verification-input" maxlength="1" required>
                            </div>

                            <button type="submit" class="btn btn-primary" style="width: 100%;" id="verify-submit-btn">
                                Verify Phone
                            </button>
                        </form>

                        <div class="resend-code">
                            Didn't receive the code? <a href="#" id="resend-code">Resend Code</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachVerificationEventListeners(phoneNumber);
    }

    attachVerificationEventListeners(phoneNumber) {
        const form = document.getElementById('verification-form');
        const inputs = document.querySelectorAll('.verification-input');
        const resendLink = document.getElementById('resend-code');

        // Auto-tab between inputs
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                // Only allow numbers
                e.target.value = e.target.value.replace(/\D/g, '');

                if (e.target.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });

        form.addEventListener('submit', (e) => this.handleVerification(e, phoneNumber));
        resendLink.addEventListener('click', (e) => this.handleResendCode(e, phoneNumber));

        // Focus first input
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }

    async handleVerification(e, phoneNumber) {
        e.preventDefault();

        const submitBtn = document.getElementById('verify-submit-btn');
        Utils.setButtonLoading(submitBtn, true);

        const inputs = document.querySelectorAll('.verification-input');
        const code = Array.from(inputs).map(input => input.value).join('');

        if (code.length !== 6) {
            Utils.showAlert('Please enter the complete 6-digit code', 'error');
            Utils.setButtonLoading(submitBtn, false);
            return;
        }

        try {
            // Get fresh CSRF token
            const csrfToken = await this.getCSRFToken();

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.VERIFY_PHONE, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    code: code
                })
            });

            const data = await response.json();

            if (data.success) {
                Utils.showAlert('Phone verified successfully! Please login.', 'success');
                this.switchTab('login');
            } else {
                Utils.showAlert(data.message || 'Verification failed', 'error');
            }
        } catch (error) {
            console.error('Verification error:', error);
            Utils.showAlert('Network error. Please try again.', 'error');
        } finally {
            Utils.setButtonLoading(submitBtn, false);
        }
    }

    clearErrors(formType) {
        const errorElements = document.querySelectorAll(`[id$="-error"]`);
        errorElements.forEach(el => {
            if (el.id.startsWith(formType)) {
                el.textContent = '';
            }
        });
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
        }
    }

    handleForgotPassword(e) {
        e.preventDefault();
        Utils.showAlert('Password reset feature coming soon!', 'warning');
    }

    async handleResendCode(e, phoneNumber) {
        e.preventDefault();
        Utils.showAlert('Verification code resent!', 'success');
    }

    async logout() {
        try {
            // Get fresh CSRF token
            const csrfToken = await this.getCSRFToken();

            await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': csrfToken
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            window.appState.clearUser();
            this.renderAuthView();
            Utils.showAlert('Logged out successfully', 'success');
        }
    }
}

// Create global instance
window.authManager = new AuthManager();