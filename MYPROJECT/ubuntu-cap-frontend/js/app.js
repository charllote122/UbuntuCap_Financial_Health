// Main Application
class UbuntuCapApp {
    constructor() {
        this.authManager = new AuthManager();
        this.dashboardManager = new DashboardManager();
        this.profileManager = new ProfileManager();
        this.loansManager = new LoansManager();
        this.mpesaManager = new MpesaManager();
        this.creditScoringManager = new CreditScoringManager(); // Added Credit Scoring Manager
        this.init();
    }

    init() {
        console.log('UbuntuCap App Initialized');

        // Load header and footer
        this.loadHeader();
        this.loadFooter();

        // Check authentication status and load appropriate view
        this.checkAuthAndLoadView();
    }

    loadHeader() {
        const headerContainer = document.getElementById('header');
        headerContainer.innerHTML = `
            <header style="background: var(--primary-color); color: white; padding: 1rem 0;">
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center;">
                            <div style="font-size: 1.5rem; font-weight: 700; margin-right: 2rem;">
                                UbuntuCap
                            </div>
                            <nav id="main-nav" style="display: flex; gap: 1.5rem;">
                                <!-- Navigation will be populated based on auth status -->
                            </nav>
                        </div>
                        <div id="auth-buttons">
                            <!-- Auth buttons will be populated based on auth status -->
                        </div>
                    </div>
                </div>
            </header>
        `;

        this.updateHeader();
    }

    loadFooter() {
        const footerContainer = document.getElementById('footer');
        footerContainer.innerHTML = `
            <footer style="background: var(--primary-color); color: white; padding: 2rem 0; margin-top: 3rem;">
                <div class="container">
                    <div class="row">
                        <div class="col-4">
                            <h3 style="margin-bottom: 1rem;">UbuntuCap</h3>
                            <p>Financial health and credit scoring platform for Kenya.</p>
                        </div>
                        <div class="col-4">
                            <h4 style="margin-bottom: 1rem;">Quick Links</h4>
                            <ul style="list-style: none; padding: 0;">
                                <li><a href="#" data-nav="about" style="color: white; text-decoration: none;">About Us</a></li>
                                <li><a href="#" data-nav="contact" style="color: white; text-decoration: none;">Contact</a></li>
                                <li><a href="#" style="color: white; text-decoration: none;">Privacy Policy</a></li>
                                <li><a href="#" style="color: white; text-decoration: none;">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div class="col-4">
                            <h4 style="margin-bottom: 1rem;">Contact Info</h4>
                            <p>Email: support@ubuntucap.com</p>
                            <p>Phone: +254 700 000 000</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p>&copy; 2024 UbuntuCap. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;

        // Attach footer navigation event listeners
        this.attachFooterNavigation();
    }

    attachFooterNavigation() {
        // Add event listeners to footer links
        document.querySelectorAll('footer [data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.dataset.nav);
            });
        });
    }

    updateHeader() {
        const navContainer = document.getElementById('main-nav');
        const authButtons = document.getElementById('auth-buttons');

        if (window.appState.isAuthenticated) {
            // Authenticated user navigation
            navContainer.innerHTML = `
                <a href="#" data-nav="dashboard" style="color: white; text-decoration: none;">Dashboard</a>
                <a href="#" data-nav="loans" style="color: white; text-decoration: none;">Loans</a>
                <a href="#" data-nav="credit" style="color: white; text-decoration: none;">Credit Score</a>
                <a href="#" data-nav="mpesa" style="color: white; text-decoration: none;">M-Pesa</a>
                <a href="#" data-nav="profile" style="color: white; text-decoration: none;">Profile</a>
            `;

            authButtons.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="display: flex; align-items: center;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin-right: 0.5rem;">
                            ${window.appState.user?.first_name ? window.appState.user.first_name[0].toUpperCase() : 'U'}
                        </div>
                        <span>Hello, ${window.appState.user?.first_name || 'User'}</span>
                    </div>
                    <button class="btn btn-outline" id="logout-btn" 
                            style="color: white; border-color: white;">
                        Logout
                    </button>
                </div>
            `;

            // Attach navigation event listeners
            document.querySelectorAll('[data-nav]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleNavigation(e.target.dataset.nav);
                });
            });

            document.getElementById('logout-btn').addEventListener('click', () => {
                this.handleLogout();
            });

        } else {
            // Guest navigation
            navContainer.innerHTML = `
                <a href="#" data-nav="home" style="color: white; text-decoration: none;">Home</a>
                <a href="#" data-nav="about" style="color: white; text-decoration: none;">About</a>
                <a href="#" data-nav="contact" style="color: white; text-decoration: none;">Contact</a>
            `;

            authButtons.innerHTML = `
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-outline" id="login-btn" 
                            style="color: white; border-color: white;">
                        Login
                    </button>
                    <button class="btn btn-primary" id="register-btn">
                        Get Started
                    </button>
                </div>
            `;

            document.getElementById('login-btn').addEventListener('click', () => {
                this.authManager.switchTab('login');
            });

            document.getElementById('register-btn').addEventListener('click', () => {
                this.authManager.switchTab('register');
            });
        }
    }

    checkAuthAndLoadView() {
        const loadingElement = document.getElementById('loading');

        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }

        if (window.appState.isAuthenticated) {
            this.dashboardManager.loadDashboard();
        } else {
            this.showLandingPage(); // Show landing page for guests
        }

        this.updateHeader();
    }

    showLandingPage() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="landing-page">
                <!-- Hero Section -->
                <section class="hero" style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); color: white; padding: 4rem 0; text-align: center;">
                    <div class="container">
                        <h1 style="font-size: 3rem; margin-bottom: 1rem;">Financial Freedom Starts Here</h1>
                        <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">
                            Get instant loans, build your credit score, and take control of your financial health with UbuntuCap.
                        </p>
                        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                            <button class="btn btn-primary btn-large" id="hero-register-btn">
                                Get Started Free
                            </button>
                            <button class="btn btn-outline btn-large" id="hero-learn-more" style="color: white; border-color: white;">
                                Learn More
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Features Section -->
                <section style="padding: 4rem 0;">
                    <div class="container">
                        <h2 style="text-align: center; margin-bottom: 3rem;">Why Choose UbuntuCap?</h2>
                        <div class="row">
                            <div class="col-4">
                                <div style="text-align: center; padding: 2rem;">
                                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚡</div>
                                    <h3>Instant Loans</h3>
                                    <p>Get approved for loans in minutes with our automated credit scoring system.</p>
                                </div>
                            </div>
                            <div class="col-4">
                                <div style="text-align: center; padding: 2rem;">
                                    <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                                    <h3>AI Credit Scoring</h3>
                                    <p>Advanced machine learning analyzes your financial behavior for accurate credit assessment.</p>
                                </div>
                            </div>
                            <div class="col-4">
                                <div style="text-align: center; padding: 2rem;">
                                    <div style="font-size: 3rem; margin-bottom: 1rem;">💳</div>
                                    <h3>M-Pesa Integration</h3>
                                    <p>Leverage your M-Pesa transaction history for better loan terms and financial insights.</p>
                                </div>
                            </div>
                        </div>
                        <div class="row" style="margin-top: 2rem;">
                            <div class="col-4">
                                <div style="text-align: center; padding: 2rem;">
                                    <div style="font-size: 3rem; margin-bottom: 1rem;">🛡️</div>
                                    <h3>Secure & Reliable</h3>
                                    <p>Bank-level security and 24/7 customer support for your peace of mind.</p>
                                </div>
                            </div>
                            <div class="col-4">
                                <div style="text-align: center; padding: 2rem;">
                                    <div style="font-size: 3rem; margin-bottom: 1rem;">📈</div>
                                    <h3>Financial Insights</h3>
                                    <p>Get personalized tips to improve your financial health and credit score.</p>
                                </div>
                            </div>
                            <div class="col-4">
                                <div style="text-align: center; padding: 2rem;">
                                    <div style="font-size: 3rem; margin-bottom: 1rem;">💰</div>
                                    <h3>Better Rates</h3>
                                    <p>Good credit behavior earns you lower interest rates and higher loan amounts.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- How It Works Section -->
                <section style="background: #f8f9fa; padding: 4rem 0;">
                    <div class="container">
                        <h2 style="text-align: center; margin-bottom: 3rem;">How It Works</h2>
                        <div class="row">
                            <div class="col-3">
                                <div style="text-align: center; padding: 1rem;">
                                    <div style="width: 60px; height: 60px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5rem; margin: 0 auto 1rem;">1</div>
                                    <h4>Sign Up</h4>
                                    <p>Create your account in minutes with basic information</p>
                                </div>
                            </div>
                            <div class="col-3">
                                <div style="text-align: center; padding: 1rem;">
                                    <div style="width: 60px; height: 60px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5rem; margin: 0 auto 1rem;">2</div>
                                    <h4>Get Scored</h4>
                                    <p>Our AI analyzes your financial patterns for credit scoring</p>
                                </div>
                            </div>
                            <div class="col-3">
                                <div style="text-align: center; padding: 1rem;">
                                    <div style="width: 60px; height: 60px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5rem; margin: 0 auto 1rem;">3</div>
                                    <h4>Receive Offers</h4>
                                    <p>Get personalized loan offers based on your credit score</p>
                                </div>
                            </div>
                            <div class="col-3">
                                <div style="text-align: center; padding: 1rem;">
                                    <div style="width: 60px; height: 60px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5rem; margin: 0 auto 1rem;">4</div>
                                    <h4>Grow</h4>
                                    <p>Improve your score over time for better financial opportunities</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- CTA Section -->
                <section style="padding: 4rem 0; text-align: center;">
                    <div class="container">
                        <h2 style="margin-bottom: 1rem;">Ready to Transform Your Financial Health?</h2>
                        <p style="margin-bottom: 2rem; color: #7f8c8d;">
                            Join thousands of Kenyans who have unlocked better financial opportunities with UbuntuCap.
                        </p>
                        <button class="btn btn-primary btn-large" id="cta-register-btn">
                            Create Your Account Now
                        </button>
                        <div style="margin-top: 2rem; color: #7f8c8d;">
                            <p>✓ No hidden fees &nbsp; • &nbsp; ✓ Instant approval &nbsp; • &nbsp; ✓ Secure & confidential</p>
                        </div>
                    </div>
                </section>
            </div>
        `;

        // Attach landing page event listeners
        this.attachLandingPageEvents();
    }

    attachLandingPageEvents() {
        const heroRegisterBtn = document.getElementById('hero-register-btn');
        const ctaRegisterBtn = document.getElementById('cta-register-btn');
        const learnMoreBtn = document.getElementById('hero-learn-more');

        if (heroRegisterBtn) {
            heroRegisterBtn.addEventListener('click', () => {
                this.authManager.switchTab('register');
            });
        }

        if (ctaRegisterBtn) {
            ctaRegisterBtn.addEventListener('click', () => {
                this.authManager.switchTab('register');
            });
        }

        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                this.handleNavigation('about');
            });
        }
    }

    handleNavigation(destination) {
        switch (destination) {
            case 'dashboard':
                this.dashboardManager.loadDashboard();
                break;
            case 'loans':
                if (this.loansManager) {
                    this.loansManager.showLoansList();
                } else {
                    Utils.showAlert('Loans module is not available', 'error');
                }
                break;
            case 'credit':
                if (this.creditScoringManager) {
                    this.creditScoringManager.showCreditDashboard();
                } else {
                    Utils.showAlert('Credit scoring module is not available', 'error');
                }
                break;
            case 'mpesa':
                if (this.mpesaManager) {
                    this.mpesaManager.showMpesaDashboard();
                } else {
                    Utils.showAlert('M-Pesa module is not available', 'error');
                }
                break;
            case 'profile':
                if (this.profileManager) {
                    this.profileManager.showProfileEditor();
                } else {
                    Utils.showAlert('Profile module is not available', 'error');
                }
                break;
            case 'home':
                if (window.appState.isAuthenticated) {
                    this.dashboardManager.loadDashboard();
                } else {
                    this.showLandingPage();
                }
                break;
            case 'about':
                this.showAboutPage();
                break;
            case 'contact':
                this.showContactPage();
                break;
            default:
                console.warn('Unknown navigation destination:', destination);
        }
    }

    showAboutPage() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>About UbuntuCap</h1>
                            <p>Empowering financial freedom across Kenya through AI-powered credit scoring</p>
                        </div>
                        <button class="btn btn-secondary" id="back-to-home">
                            Back to Home
                        </button>
                    </div>

                    <div class="row">
                        <div class="col-8">
                            <div class="card">
                                <div class="card-header">
                                    <h3>Our Mission</h3>
                                </div>
                                <div class="card-body">
                                    <p>UbuntuCap is dedicated to providing accessible financial services to all Kenyans through innovative technology and data-driven credit scoring. We believe everyone deserves access to fair credit, regardless of their banking history.</p>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3>How It Works</h3>
                                </div>
                                <div class="card-body">
                                    <p>We use advanced machine learning algorithms to analyze your M-Pesa transaction history and other financial data to build a comprehensive credit profile. This enables us to offer personalized loan products with fair terms tailored to your financial behavior.</p>
                                    <div style="margin-top: 1.5rem;">
                                        <h4>Our AI Credit Scoring Process:</h4>
                                        <ul>
                                            <li><strong>Transaction Analysis:</strong> Analyze your M-Pesa transaction patterns</li>
                                            <li><strong>Behavioral Scoring:</strong> Assess financial consistency and responsibility</li>
                                            <li><strong>Risk Assessment:</strong> Evaluate creditworthiness using multiple factors</li>
                                            <li><strong>Personalized Offers:</strong> Generate loan offers based on your unique profile</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="card">
                                <div class="card-header">
                                    <h3>Technology</h3>
                                </div>
                                <div class="card-body">
                                    <p>We leverage cutting-edge technologies:</p>
                                    <ul>
                                        <li>Machine Learning Algorithms</li>
                                        <li>Real-time Data Processing</li>
                                        <li>Bank-grade Security</li>
                                        <li>Mobile-first Design</li>
                                    </ul>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3>Security & Privacy</h3>
                                </div>
                                <div class="card-body">
                                    <p>Your data is protected with bank-level security measures. We never share your personal information without your consent and comply with all Kenyan data protection regulations.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('back-to-home').addEventListener('click', () => {
            this.handleNavigation('home');
        });
    }

    showContactPage() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>Contact Us</h1>
                            <p>We're here to help you achieve financial freedom</p>
                        </div>
                        <button class="btn btn-secondary" id="back-to-home">
                            Back to Home
                        </button>
                    </div>

                    <div class="row">
                        <div class="col-6">
                            <div class="card">
                                <div class="card-header">
                                    <h3>Get In Touch</h3>
                                </div>
                                <div class="card-body">
                                    <div style="space-y-3">
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
                                                <strong>Business Hours</strong>
                                                <div>Monday - Friday: 8:00 AM - 6:00 PM EAT</div>
                                                <div>Saturday: 9:00 AM - 1:00 PM EAT</div>
                                            </div>
                                        </div>
                                        <div style="display: flex; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                                            <div style="font-size: 1.5rem; margin-right: 1rem;">📍</div>
                                            <div>
                                                <strong>Address</strong>
                                                <div>Nairobi, Kenya</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="card">
                                <div class="card-header">
                                    <h3>Send us a Message</h3>
                                </div>
                                <div class="card-body">
                                    <form id="contact-form">
                                        <div class="form-group">
                                            <label class="form-label">Your Name</label>
                                            <input type="text" class="form-control" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Email Address</label>
                                            <input type="email" class="form-control" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Phone Number</label>
                                            <input type="tel" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Subject</label>
                                            <select class="form-control" required>
                                                <option value="">Select a subject</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="support">Technical Support</option>
                                                <option value="loan">Loan Application</option>
                                                <option value="credit">Credit Score</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Message</label>
                                            <textarea class="form-control" rows="4" placeholder="How can we help you?" required></textarea>
                                        </div>
                                        <button type="submit" class="btn btn-primary">Send Message</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('back-to-home').addEventListener('click', () => {
            this.handleNavigation('home');
        });

        document.getElementById('contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            Utils.showAlert('Thank you for your message! We will get back to you within 24 hours.', 'success');
            document.getElementById('contact-form').reset();
        });
    }

    async handleLogout() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            // Clear app state regardless of API response
            window.appState.clearUser();
            this.updateHeader();
            this.showLandingPage();

            Utils.showAlert('Logged out successfully', 'success');

        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API call fails
            window.appState.clearUser();
            this.updateHeader();
            this.showLandingPage();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ubuntuCapApp = new UbuntuCapApp();
});

// Make managers globally available for navigation
window.authManager = new AuthManager();
window.dashboardManager = new DashboardManager();
window.profileManager = new ProfileManager();
window.loansManager = new LoansManager();
window.mpesaManager = new MpesaManager();
window.creditScoringManager = new CreditScoringManager(); // Added Credit Scoring Manager globally