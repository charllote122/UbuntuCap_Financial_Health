// Dashboard Management
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        // Dashboard will be loaded when user is authenticated
    }

    async loadDashboard() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>Welcome back, <span id="user-name">User</span>!</h1>
                            <p>Here's your financial overview</p>
                        </div>
                        <div class="dashboard-actions">
                            <button class="btn btn-primary" id="apply-loan-btn">Apply for Loan</button>
                        </div>
                    </div>

                    <div class="dashboard-stats" id="dashboard-stats">
                        <div class="stat-card">
                            <div class="stat-value">KES 0</div>
                            <div class="stat-label">Total Borrowed</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">KES 0</div>
                            <div class="stat-label">Total Repaid</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">KES 0</div>
                            <div class="stat-label">Outstanding</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Active Loans</div>
                        </div>
                    </div>

                    <div class="dashboard-sections">
                        <div class="main-section">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Quick Actions</h3>
                                </div>
                                <div class="quick-actions">
                                    <div class="action-btn" data-action="profile">
                                        <div class="action-icon">👤</div>
                                        <div>Update Profile</div>
                                    </div>
                                    <div class="action-btn" data-action="loans">
                                        <div class="action-icon">💰</div>
                                        <div>My Loans</div>
                                    </div>
                                    <div class="action-btn" data-action="mpesa">
                                        <div class="action-icon">💳</div>
                                        <div>M-Pesa Analysis</div>
                                    </div>
                                    <div class="action-btn" data-action="verify">
                                        <div class="action-icon">✓</div>
                                        <div>Verify Account</div>
                                    </div>
                                    <div class="action-btn" data-action="support">
                                        <div class="action-icon">💬</div>
                                        <div>Support</div>
                                    </div>
                                    <div class="action-btn" data-action="credit">
                                        <div class="action-icon">📊</div>
                                        <div>Credit Score</div>
                                    </div>  
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Recent Activity</h3>
                                </div>
                                <div id="recent-activity">
                                    <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                                        <p>Loading recent activity...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="sidebar-section">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Profile Completion</h3>
                                </div>
                                <div class="profile-completion">
                                    <div id="completion-percentage">0%</div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 0%"></div>
                                    </div>
                                    <p>Complete your profile to unlock all features</p>
                                    <button class="btn btn-outline" id="complete-profile-btn">
                                        Complete Profile
                                    </button>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Credit Score</h3>
                                </div>
                                <div id="credit-score-display">
                                    <div style="text-align: center; padding: 1rem; color: #7f8c8d;">
                                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                                        <p>Loading credit score...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachDashboardEventListeners();
        await this.loadDashboardData();
    }

    attachDashboardEventListeners() {
        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Apply for loan button
        document.getElementById('apply-loan-btn').addEventListener('click', () => {
            if (window.loansManager) {
                window.loansManager.showLoanApplication();
            } else {
                Utils.showAlert('Loans module is not available', 'error');
            }
        });

        // Complete profile button
        document.getElementById('complete-profile-btn').addEventListener('click', () => {
            if (window.profileManager) {
                window.profileManager.showProfileEditor();
            } else {
                Utils.showAlert('Profile manager is not available', 'error');
            }
        });
    }

    async loadDashboardData() {
        try {
            console.log('🟡 Loading dashboard data...');

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.DASHBOARD, {
                method: 'GET',
                credentials: 'include', // Use session cookies instead of Bearer token
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            console.log('📡 Dashboard response status:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    // User not authenticated, redirect to login
                    window.authManager.renderAuthView();
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📡 Dashboard data:', data);

            if (data.success) {
                this.updateDashboardUI(data.dashboard || data);
            } else {
                throw new Error(data.message || 'Failed to load dashboard data');
            }
        } catch (error) {
            console.error('❌ Dashboard loading error:', error);
            this.showErrorState(error.message);
        }
    }

    updateDashboardUI(dashboardData) {
        console.log('🟡 Updating dashboard UI with:', dashboardData);

        // Update user name
        const userName = document.getElementById('user-name');
        if (userName) {
            const user = dashboardData.user || window.appState.user;
            if (user && user.first_name) {
                userName.textContent = user.first_name;
            }
        }

        // Update stats
        this.updateStats(dashboardData.loan_stats || dashboardData);

        // Update profile completion
        this.updateProfileCompletion(dashboardData.profile_completion || dashboardData.profile_completion_percentage || 0);

        // Update credit score
        this.updateCreditScore(dashboardData.credit_score);

        // Update verification status
        this.updateVerificationStatus(dashboardData.is_verified);

        // Update recent activity
        this.updateRecentActivity(dashboardData.recent_activity);
    }

    updateStats(loanStats) {
        const statsContainer = document.getElementById('dashboard-stats');

        if (!statsContainer) return;

        // Handle different data structures
        const totalBorrowed = loanStats.total_borrowed || loanStats.total_borrowed_amount || 0;
        const totalRepaid = loanStats.total_repaid || loanStats.total_repaid_amount || 0;
        const outstandingBalance = loanStats.outstanding_balance || loanStats.current_balance || 0;
        const activeLoans = loanStats.active_loans || loanStats.active_loan_count || 0;

        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${Utils.formatCurrency(totalBorrowed)}</div>
                <div class="stat-label">Total Borrowed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Utils.formatCurrency(totalRepaid)}</div>
                <div class="stat-label">Total Repaid</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Utils.formatCurrency(outstandingBalance)}</div>
                <div class="stat-label">Outstanding</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${activeLoans}</div>
                <div class="stat-label">Active Loans</div>
            </div>
        `;
    }

    updateProfileCompletion(percentage) {
        const percentageElement = document.getElementById('completion-percentage');
        const progressFill = document.querySelector('.progress-fill');

        if (percentageElement) {
            percentageElement.textContent = `${percentage}%`;
        }

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;

            // Change color based on completion
            if (percentage >= 80) {
                progressFill.style.background = '#27ae60';
            } else if (percentage >= 50) {
                progressFill.style.background = '#f39c12';
            } else {
                progressFill.style.background = '#e74c3c';
            }
        }
    }

    updateCreditScore(score) {
        const scoreContainer = document.getElementById('credit-score-display');

        if (score && score > 0) {
            let scoreColor = '#27ae60'; // Green
            let scoreText = 'Excellent';

            if (score < 400) {
                scoreColor = '#e74c3c'; // Red
                scoreText = 'Poor';
            } else if (score < 600) {
                scoreColor = '#f39c12'; // Orange
                scoreText = 'Fair';
            } else if (score < 800) {
                scoreColor = '#3498db'; // Blue
                scoreText = 'Good';
            }

            scoreContainer.innerHTML = `
                <div style="text-align: center; padding: 1rem;">
                    <div style="font-size: 3rem; font-weight: bold; color: ${scoreColor};">
                        ${score}
                    </div>
                    <div style="color: ${scoreColor}; font-weight: 600; margin: 0.5rem 0;">
                        ${scoreText}
                    </div>
                    <div style="color: #7f8c8d; font-size: 0.875rem;">
                        Credit Score
                    </div>
                </div>
            `;
        } else {
            scoreContainer.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: #7f8c8d;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                    <p>Complete your profile to get your credit score</p>
                    <button class="btn btn-outline" onclick="window.profileManager.showProfileEditor()" style="margin-top: 0.5rem;">
                        Complete Profile
                    </button>
                </div>
            `;
        }
    }

    updateRecentActivity(activities) {
        const activityContainer = document.getElementById('recent-activity');

        if (!activities || activities.length === 0) {
            activityContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                    <p>No recent activity</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                        Your recent transactions and activities will appear here
                    </p>
                </div>
            `;
            return;
        }

        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-content">
                    <div class="activity-description">${this.escapeHtml(activity.description || activity.message || 'Activity')}</div>
                    <div class="activity-meta">
                        ${new Date(activity.timestamp || activity.created_at).toLocaleDateString()} • 
                        ${activity.activity_type || activity.type || 'General'}
                    </div>
                </div>
                <div class="activity-time">
                    ${new Date(activity.timestamp || activity.created_at).toLocaleTimeString()}
                </div>
            </div>
        `).join('');
    }

    updateVerificationStatus(isVerified) {
        // Remove any existing verification alerts
        const existingAlert = document.querySelector('.verification-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        if (!isVerified && window.appState.user && !window.appState.user.is_verified) {
            // Add verification prompt to the dashboard
            const mainSection = document.querySelector('.main-section');
            const verificationAlert = document.createElement('div');
            verificationAlert.className = 'card verification-alert alert-warning';
            verificationAlert.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
                    <div>
                        <strong>Account Verification Required</strong>
                        <p style="margin: 0.5rem 0 0 0; color: #856404;">
                            Verify your phone number to access all features including loan applications.
                        </p>
                    </div>
                    <button class="btn btn-warning" id="verify-now-btn">
                        Verify Now
                    </button>
                </div>
            `;

            // Insert at the top of main section
            if (mainSection) {
                mainSection.insertBefore(verificationAlert, mainSection.firstChild);

                // Add event listener for verify button
                document.getElementById('verify-now-btn').addEventListener('click', () => {
                    this.showVerificationPrompt();
                });
            }
        }
    }

    handleQuickAction(action) {
        console.log('🟡 Quick action:', action);

        switch (action) {
            case 'profile':
                if (window.profileManager) {
                    window.profileManager.showProfileEditor();
                } else {
                    Utils.showAlert('Profile manager is not available', 'error');
                }
                break;
            case 'loans':
                if (window.loansManager) {
                    window.loansManager.showLoansList();
                } else {
                    Utils.showAlert('Loans module is not available', 'error');
                }
                break;
            case 'mpesa':
                if (window.mpesaManager) {
                    window.mpesaManager.showMpesaDashboard();
                } else {
                    Utils.showAlert('M-Pesa module is not available', 'error');
                }
                break;
            case 'verify':
                if (!window.appState.user?.is_verified) {
                    this.showVerificationPrompt();
                } else {
                    Utils.showAlert('Your account is already verified!', 'success');
                }
                break;
            case 'credit':
                if (window.creditScoringManager) {
                    window.creditScoringManager.showCreditDashboard();
                } else {
                    Utils.showAlert('Credit scoring module is not available', 'error');
                }
                break;
            case 'support':
                this.showSupport();
                break;
            default:
                console.warn('Unknown action:', action);
                Utils.showAlert('This feature is coming soon!', 'info');
        }
    }

    showVerificationPrompt() {
        // Create verification modal
        const modalHTML = `
            <div class="modal-overlay" id="verification-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Verify Your Phone Number</h3>
                        <button class="modal-close" id="close-verification-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>We'll send a verification code to your phone number:</p>
                        <p style="font-weight: 600; text-align: center; margin: 1rem 0; font-size: 1.1rem;">
                            ${window.appState.user?.phone_number || 'N/A'}
                        </p>
                        
                        <div class="verification-code">
                            <input type="text" class="verification-input" maxlength="1" placeholder="0">
                            <input type="text" class="verification-input" maxlength="1" placeholder="0">
                            <input type="text" class="verification-input" maxlength="1" placeholder="0">
                            <input type="text" class="verification-input" maxlength="1" placeholder="0">
                            <input type="text" class="verification-input" maxlength="1" placeholder="0">
                            <input type="text" class="verification-input" maxlength="1" placeholder="0">
                        </div>
                        
                        <div style="text-align: center; margin: 1.5rem 0;">
                            <button class="btn btn-primary" id="send-verification-code">
                                Send Verification Code
                            </button>
                        </div>
                        
                        <div class="resend-code" style="text-align: center;">
                            Didn't receive the code? <a href="#" id="resend-verification-code">Resend Code</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add modal styles if not already present
        this.addModalStyles();

        // Attach event listeners
        this.attachVerificationModalEvents();
    }

    addModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = `
            <style id="modal-styles">
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 8px;
                    padding: 0;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow: auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #e1e8ed;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: #2c3e50;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #7f8c8d;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-close:hover {
                    color: #2c3e50;
                }
                
                .modal-body {
                    padding: 1.5rem;
                }

                .verification-code {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin: 1.5rem 0;
                }

                .verification-input {
                    width: 50px;
                    height: 60px;
                    text-align: center;
                    font-size: 1.5rem;
                    border: 2px solid #e1e8ed;
                    border-radius: 8px;
                    font-weight: bold;
                }

                .verification-input:focus {
                    border-color: #3498db;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
                }

                .resend-code {
                    color: #7f8c8d;
                    font-size: 0.9rem;
                }

                .resend-code a {
                    color: #3498db;
                    text-decoration: none;
                }

                .resend-code a:hover {
                    text-decoration: underline;
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem;
                    border-bottom: 1px solid #e1e8ed;
                    transition: background-color 0.2s;
                }

                .activity-item:hover {
                    background-color: #f8f9fa;
                }

                .activity-item:last-child {
                    border-bottom: none;
                }

                .activity-content {
                    flex: 1;
                }

                .activity-description {
                    font-weight: 600;
                    color: #2c3e50;
                }

                .activity-meta {
                    color: #7f8c8d;
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                }

                .activity-time {
                    color: #7f8c8d;
                    font-size: 0.875rem;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    attachVerificationModalEvents() {
        const modal = document.getElementById('verification-modal');
        const closeBtn = document.getElementById('close-verification-modal');
        const sendCodeBtn = document.getElementById('send-verification-code');
        const resendLink = document.getElementById('resend-verification-code');
        const inputs = document.querySelectorAll('.verification-input');

        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Send verification code
        sendCodeBtn.addEventListener('click', async () => {
            try {
                Utils.showAlert('Verification code sent to your phone!', 'success');
                // TODO: Implement actual verification code sending
            } catch (error) {
                Utils.showAlert('Failed to send verification code', 'error');
            }
        });

        // Resend code
        resendLink.addEventListener('click', (e) => {
            e.preventDefault();
            Utils.showAlert('New verification code sent!', 'success');
        });

        // Auto-tab between verification inputs
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

        // Focus first input
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }

    showSupport() {
        // Create support contact modal
        const modalHTML = `
            <div class="modal-overlay" id="support-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Contact Support</h3>
                        <button class="modal-close" id="close-support-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                            <h4>We're here to help!</h4>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                                <div style="font-size: 1.5rem; margin-right: 1rem;">📧</div>
                                <div>
                                    <strong>Email</strong>
                                    <div>support@ubuntucap.com</div>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                                <div style="font-size: 1.5rem; margin-right: 1rem;">📞</div>
                                <div>
                                    <strong>Phone</strong>
                                    <div>+254 700 000 000</div>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                                <div style="font-size: 1.5rem; margin-right: 1rem;">🕒</div>
                                <div>
                                    <strong>Hours</strong>
                                    <div>Mon-Fri: 8AM-6PM EAT</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 2rem; padding: 1rem; background: #e8f4fd; border-radius: 8px;">
                            <strong>Need immediate help?</strong>
                            <p style="margin: 0.5rem 0 0 0; color: #2c3e50;">
                                For urgent issues, please call our support line directly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Attach event listeners
        const modal = document.getElementById('support-modal');
        const closeBtn = document.getElementById('close-support-modal');

        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showErrorState(message) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="dashboard">
                <div class="container">
                    <div class="error-state" style="text-align: center; padding: 3rem;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">😕</div>
                        <h2>Unable to Load Dashboard</h2>
                        <p style="color: #7f8c8d; margin-bottom: 2rem;">${message}</p>
                        <div style="display: flex; gap: 1rem; justify-content: center;">
                            <button class="btn btn-primary" id="retry-dashboard-btn">
                                Try Again
                            </button>
                            <button class="btn btn-outline" id="logout-dashboard-btn">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('retry-dashboard-btn').addEventListener('click', () => {
            this.loadDashboard();
        });

        document.getElementById('logout-dashboard-btn').addEventListener('click', () => {
            if (window.authManager) {
                window.authManager.logout();
            }
        });
    }

    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Method to refresh dashboard data
    async refreshDashboard() {
        await this.loadDashboardData();
    }

    // Method to handle logout
    handleLogout() {
        if (window.authManager) {
            window.authManager.logout();
        }
    }
}

// Create global instance
window.dashboardManager = new DashboardManager();