// M-Pesa Integration Management
class MpesaManager {
    constructor() {
        this.currentView = 'profile';
        this.init();
    }

    init() {
        console.log('🟡 MpesaManager initialized');
    }

    showMpesaDashboard() {
        this.currentView = 'profile';
        this.renderMpesaView();
    }

    showTransactionHistory() {
        this.currentView = 'transactions';
        this.renderMpesaView();
    }

    showRepayment() {
        this.currentView = 'repayment';
        this.renderMpesaView();
    }

    async renderMpesaView() {
        const mainContent = document.getElementById('main-content');

        try {
            switch (this.currentView) {
                case 'profile':
                    mainContent.innerHTML = this.getMpesaProfileHTML();
                    await this.loadMpesaProfile();
                    break;
                case 'transactions':
                    mainContent.innerHTML = this.getTransactionHistoryHTML();
                    await this.loadTransactionHistory();
                    break;
                case 'repayment':
                    mainContent.innerHTML = this.getRepaymentHTML();
                    this.attachRepaymentEventListeners();
                    break;
            }
        } catch (error) {
            console.error('❌ Error rendering M-Pesa view:', error);
            Utils.showAlert(`Failed to load M-Pesa: ${error.message}`, 'error');
        }
    }

    getMpesaProfileHTML() {
        return `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>M-Pesa Financial Profile</h1>
                            <p>Your financial health analysis based on M-Pesa transactions</p>
                        </div>
                        <div class="dashboard-actions">
                            <button class="btn btn-secondary" id="back-to-dashboard">
                                ← Back to Dashboard
                            </button>
                            <button class="btn btn-primary" id="refresh-analysis">
                                🔄 Refresh Analysis
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-8">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">📊 Financial Overview</h3>
                                </div>
                                <div class="card-body">
                                    <div id="financial-overview">
                                        <div class="loading-state">
                                            <div class="loading-spinner"></div>
                                            <p>Loading your financial profile...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">⚡ Quick Actions</h3>
                                </div>
                                <div class="card-body">
                                    <div class="quick-actions-grid">
                                        <div class="quick-action-btn" data-action="transactions">
                                            <div class="action-icon">📈</div>
                                            <div class="action-text">Transaction History</div>
                                        </div>
                                        <div class="quick-action-btn" data-action="repayment">
                                            <div class="action-icon">💳</div>
                                            <div class="action-text">Make Repayment</div>
                                        </div>
                                        <div class="quick-action-btn" data-action="simulate">
                                            <div class="action-icon">🔄</div>
                                            <div class="action-text">Simulate Data</div>
                                        </div>
                                        <div class="quick-action-btn" data-action="export">
                                            <div class="action-icon">📤</div>
                                            <div class="action-text">Export Data</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">❤️ Financial Health Score</h3>
                                </div>
                                <div class="card-body">
                                    <div id="health-score">
                                        <div class="loading-state">
                                            <div class="loading-spinner"></div>
                                            <p>Calculating score...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">📋 Analysis Details</h3>
                                </div>
                                <div class="card-body">
                                    <div id="analysis-details">
                                        <div class="loading-state">
                                            <div class="loading-spinner"></div>
                                            <p>Loading analysis...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getTransactionHistoryHTML() {
        return `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>M-Pesa Transaction History</h1>
                            <p>Your recent M-Pesa transactions and analysis</p>
                        </div>
                        <div class="dashboard-actions">
                            <button class="btn btn-secondary" id="back-to-profile">
                                ← Back to Profile
                            </button>
                            <button class="btn btn-primary" id="simulate-transactions">
                                🔄 Simulate Transactions
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <div class="card-header-content">
                                        <h3 class="card-title">💳 Recent Transactions</h3>
                                        <div class="filter-control">
                                            <select id="transaction-filter" class="form-control">
                                                <option value="all">All Transactions</option>
                                                <option value="C2B">Income</option>
                                                <option value="C2C">Transfers</option>
                                                <option value="PAYMENT">Payments</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <div id="transactions-list">
                                        <div class="loading-state">
                                            <div class="loading-spinner"></div>
                                            <p>Loading your transactions...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getRepaymentHTML() {
        return `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>Loan Repayment</h1>
                            <p>Repay your loan using M-Pesa</p>
                        </div>
                        <div class="dashboard-actions">
                            <button class="btn btn-secondary" id="back-to-profile">
                                ← Back to Profile
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-6">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">💸 Initiate Repayment</h3>
                                </div>
                                <div class="card-body">
                                    <form id="repayment-form">
                                        <div class="form-group">
                                            <label class="form-label">Phone Number</label>
                                            <input type="tel" class="form-control" 
                                                   id="repayment-phone" 
                                                   value="${window.appState.user?.phone_number || ''}"
                                                   placeholder="+254712345678" required>
                                            <div class="form-help">
                                                Ensure this is your M-Pesa registered number
                                            </div>
                                            <div class="form-error" id="phone-error"></div>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">Amount (KES)</label>
                                            <input type="number" class="form-control" 
                                                   id="repayment-amount" 
                                                   min="100" max="50000"
                                                   placeholder="Enter amount to repay" required>
                                            <div class="form-help">
                                                Minimum: KES 100, Maximum: KES 50,000
                                            </div>
                                            <div class="form-error" id="amount-error"></div>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">Loan Account</label>
                                            <select class="form-control" id="loan-account" required>
                                                <option value="">Select Loan Account</option>
                                            </select>
                                            <div class="form-error" id="loan-error"></div>
                                        </div>

                                        <div class="form-group">
                                            <label class="consent-label">
                                                <input type="checkbox" required>
                                                <span class="consent-text">
                                                    I authorize UbuntuCap to initiate an M-Pesa payment request 
                                                    for the specified amount. Standard M-Pesa charges apply.
                                                </span>
                                            </label>
                                            <div class="form-error" id="consent-error"></div>
                                        </div>

                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-primary" id="submit-repayment">
                                                📱 Initiate M-Pesa Payment
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div class="col-6">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">📝 Payment Instructions</h3>
                                </div>
                                <div class="card-body">
                                    <div class="instructions">
                                        <h4>How to complete your payment:</h4>
                                        <ol class="instruction-steps">
                                            <li>Click "Initiate M-Pesa Payment"</li>
                                            <li>Check your phone for STK Push prompt</li>
                                            <li>Enter your M-Pesa PIN when prompted</li>
                                            <li>Wait for confirmation message</li>
                                            <li>Payment will reflect immediately</li>
                                        </ol>

                                        <div class="important-notes">
                                            <h5>Important Notes:</h5>
                                            <ul>
                                                <li>Ensure sufficient balance in your M-Pesa account</li>
                                                <li>Keep your phone nearby during the process</li>
                                                <li>Standard M-Pesa transaction fees apply</li>
                                                <li>Contact support if you encounter any issues</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">🕒 Recent Repayments</h3>
                                </div>
                                <div class="card-body">
                                    <div id="recent-repayments">
                                        <div class="empty-state">
                                            <div class="empty-icon">💳</div>
                                            <p>No recent repayments found</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadMpesaProfile() {
        try {
            console.log('🟡 Loading M-Pesa profile...');
            Utils.showLoading('Loading financial profile...');

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.MPESA.PROFILE, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            console.log('📡 M-Pesa profile response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to load profile`);
            }

            const data = await response.json();
            console.log('📡 M-Pesa profile data:', data);

            if (data.profile || data.success) {
                this.renderMpesaProfile(data.profile || data);
                this.attachMpesaProfileEventListeners();
            } else {
                this.showNoDataState();
            }
        } catch (error) {
            console.error('❌ Error loading M-Pesa profile:', error);
            this.showNoDataState();
        } finally {
            Utils.hideLoading();
        }
    }

    renderMpesaProfile(profile) {
        console.log('🟡 Rendering M-Pesa profile:', profile);

        // Financial Overview
        document.getElementById('financial-overview').innerHTML = `
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${profile.average_weekly_income ? Utils.formatCurrency(profile.average_weekly_income) : 'KES 0'}</div>
                    <div class="metric-label">Average Weekly Income</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${profile.average_weekly_expenses ? Utils.formatCurrency(profile.average_weekly_expenses) : 'KES 0'}</div>
                    <div class="metric-label">Average Weekly Expenses</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${profile.network_diversity || 0}</div>
                    <div class="metric-label">Unique Contacts</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${profile.active_days || 0}</div>
                    <div class="metric-label">Active Days (90 days)</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${profile.total_transactions || 0}</div>
                    <div class="metric-label">Total Transactions</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${profile.total_volume ? Utils.formatCurrency(profile.total_volume) : 'KES 0'}</div>
                    <div class="metric-label">Total Volume</div>
                </div>
            </div>
        `;

        // Calculate health score
        const consistency = profile.transaction_consistency ? parseFloat(profile.transaction_consistency) : 0.5;
        const savingsHabit = profile.has_savings_habit ? 0.8 : 0.2;
        const fulizaRatio = profile.fuliza_repayment_ratio ? parseFloat(profile.fuliza_repayment_ratio) : 0.7;

        const healthScore = Math.round((consistency * 0.4 + savingsHabit * 0.3 + fulizaRatio * 0.3) * 100);

        // Health Score
        document.getElementById('health-score').innerHTML = `
            <div class="health-score-display">
                <div class="score-chart-container">
                    <canvas id="health-score-chart" width="150" height="150"></canvas>
                    <div class="score-overlay">
                        <div class="score-value">${healthScore}</div>
                        <div class="score-label">Score</div>
                    </div>
                </div>
                <div class="score-description">
                    <div class="score-title">${this.getScoreDescription(healthScore)}</div>
                    <div class="score-subtitle">Based on transaction analysis</div>
                </div>
            </div>
        `;

        this.renderHealthScoreChart(healthScore);

        // Analysis Details
        document.getElementById('analysis-details').innerHTML = `
            <div class="analysis-details">
                <div class="detail-item">
                    <span>Transaction Consistency:</span>
                    <span><strong>${Math.round(consistency * 100)}%</strong></span>
                </div>
                <div class="detail-item">
                    <span>Savings Habit:</span>
                    <span><strong>${savingsHabit > 0.5 ? 'Yes' : 'No'}</strong></span>
                </div>
                <div class="detail-item">
                    <span>Fuliza Repayment:</span>
                    <span><strong>${Math.round(fulizaRatio * 100)}%</strong></span>
                </div>
                <div class="detail-item">
                    <span>Last Analysis:</span>
                    <span><strong>${profile.last_analysis ? new Date(profile.last_analysis).toLocaleDateString() : 'Never'}</strong></span>
                </div>
            </div>
        `;
    }

    renderHealthScoreChart(score) {
        const canvas = document.getElementById('health-score-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background circle
        ctx.beginPath();
        ctx.arc(75, 75, 70, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e1e8ed';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Draw score arc
        const startAngle = -0.5 * Math.PI;
        const endAngle = startAngle + (score / 100) * 2 * Math.PI;

        ctx.beginPath();
        ctx.arc(75, 75, 70, startAngle, endAngle);
        ctx.strokeStyle = this.getScoreColor(score);
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    getScoreColor(score) {
        if (score >= 80) return '#27ae60';
        if (score >= 60) return '#f39c12';
        return '#e74c3c';
    }

    getScoreDescription(score) {
        if (score >= 80) return 'Excellent Financial Health';
        if (score >= 60) return 'Good Financial Health';
        if (score >= 40) return 'Fair Financial Health';
        return 'Needs Improvement';
    }

    showNoDataState() {
        document.getElementById('financial-overview').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No Transaction Data Available</h3>
                <p>We need M-Pesa transaction data to generate your financial profile.</p>
                <button class="btn btn-primary" id="simulate-data-btn">
                    🔄 Simulate Sample Data
                </button>
            </div>
        `;

        document.getElementById('health-score').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📈</div>
                <p>No data available for analysis</p>
            </div>
        `;

        document.getElementById('analysis-details').innerHTML = `
            <div class="empty-state">
                <p>Complete analysis will appear here once data is available</p>
            </div>
        `;
    }

    attachMpesaProfileEventListeners() {
        console.log('🟡 Attaching M-Pesa profile event listeners...');

        const backButton = document.getElementById('back-to-dashboard');
        const refreshButton = document.getElementById('refresh-analysis');
        const actionButtons = document.querySelectorAll('.quick-action-btn');
        const simulateButton = document.getElementById('simulate-data-btn');

        if (backButton) {
            backButton.addEventListener('click', () => {
                window.dashboardManager.loadDashboard();
            });
        }

        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshAnalysis();
            });
        }

        if (simulateButton) {
            simulateButton.addEventListener('click', () => {
                this.simulateTransactionData();
            });
        }

        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        console.log('🟡 Quick action:', action);
        switch (action) {
            case 'transactions':
                this.showTransactionHistory();
                break;
            case 'repayment':
                this.showRepayment();
                break;
            case 'simulate':
                this.simulateTransactionData();
                break;
            case 'export':
                this.exportData();
                break;
        }
    }

    async refreshAnalysis() {
        try {
            Utils.showAlert('Refreshing your financial analysis...', 'info');

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.MPESA.ANALYZE_TRANSACTIONS, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            const data = await response.json();

            if (data.success) {
                Utils.showAlert('Analysis refreshed successfully!', 'success');
                this.loadMpesaProfile();
            } else {
                throw new Error(data.message || 'Failed to refresh analysis');
            }
        } catch (error) {
            console.error('❌ Error refreshing analysis:', error);
            Utils.showAlert(`Failed to refresh analysis: ${error.message}`, 'error');
        }
    }

    async simulateTransactionData() {
        try {
            Utils.showAlert('Generating sample transaction data...', 'info');

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.MPESA.SIMULATE_TRANSACTIONS, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                },
                body: JSON.stringify({ months: 6 })
            });

            const data = await response.json();

            if (data.success) {
                Utils.showAlert(`Successfully generated ${data.transactions_created} sample transactions!`, 'success');
                setTimeout(() => {
                    this.refreshAnalysis();
                }, 1000);
            } else {
                throw new Error(data.message || 'Failed to generate sample data');
            }
        } catch (error) {
            console.error('❌ Error simulating transaction data:', error);
            Utils.showAlert(`Failed to generate sample data: ${error.message}`, 'error');
        }
    }

    async loadTransactionHistory() {
        try {
            console.log('🟡 Loading transaction history...');
            Utils.showLoading('Loading transactions...');

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.MPESA.TRANSACTION_HISTORY, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            console.log('📡 Transaction history response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to load transactions`);
            }

            const data = await response.json();
            console.log('📡 Transaction history data:', data);

            if (data.transactions || data.success) {
                this.renderTransactionHistory(data.transactions || []);
                this.attachTransactionHistoryEventListeners();
            } else {
                this.showNoTransactionsState();
            }
        } catch (error) {
            console.error('❌ Error loading transaction history:', error);
            this.showNoTransactionsState();
        } finally {
            Utils.hideLoading();
        }
    }

    renderTransactionHistory(transactions) {
        const container = document.getElementById('transactions-list');

        if (!transactions || transactions.length === 0) {
            this.showNoTransactionsState();
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Counterparty</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(transaction => `
                            <tr>
                                <td>${new Date(transaction.transaction_date || transaction.date).toLocaleDateString()}</td>
                                <td>
                                    <span class="transaction-type type-${(transaction.type || '').toLowerCase()}">
                                        ${transaction.type || 'N/A'}
                                    </span>
                                </td>
                                <td class="amount-cell">${Utils.formatCurrency(transaction.amount)}</td>
                                <td>${transaction.counterparty || 'N/A'}</td>
                                <td>${transaction.description || 'No description'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="table-footer">
                Showing ${transactions.length} most recent transactions
            </div>
        `;
    }

    showNoTransactionsState() {
        document.getElementById('transactions-list').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💳</div>
                <h3>No Transactions Found</h3>
                <p>You don't have any M-Pesa transactions recorded yet.</p>
                <button class="btn btn-primary" id="simulate-transactions-btn">
                    🔄 Generate Sample Transactions
                </button>
            </div>
        `;
    }

    attachTransactionHistoryEventListeners() {
        console.log('🟡 Attaching transaction history event listeners...');

        const backButton = document.getElementById('back-to-profile');
        const simulateButton = document.getElementById('simulate-transactions');
        const filterSelect = document.getElementById('transaction-filter');
        const simulateBtn = document.getElementById('simulate-transactions-btn');

        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showMpesaDashboard();
            });
        }

        if (simulateButton) {
            simulateButton.addEventListener('click', () => {
                this.simulateTransactionData();
            });
        }

        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => {
                this.simulateTransactionData();
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterTransactions(e.target.value);
            });
        }
    }

    filterTransactions(filter) {
        Utils.showAlert(`Filtering transactions by: ${filter}`, 'info');
        // Implementation would filter the displayed transactions
    }

    attachRepaymentEventListeners() {
        console.log('🟡 Attaching repayment event listeners...');

        const backButton = document.getElementById('back-to-profile');
        const repaymentForm = document.getElementById('repayment-form');

        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showMpesaDashboard();
            });
        }

        if (repaymentForm) {
            repaymentForm.addEventListener('submit', (e) => {
                this.handleRepayment(e);
            });
        }

        this.loadUserLoans();
    }

    async loadUserLoans() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOANS.USER_LOANS, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.populateLoanAccounts(data.loans || []);
            }
        } catch (error) {
            console.error('❌ Error loading user loans:', error);
        }
    }

    populateLoanAccounts(loans) {
        const select = document.getElementById('loan-account');

        if (!loans || loans.length === 0) {
            select.innerHTML = '<option value="">No active loans found</option>';
            return;
        }

        const activeLoans = loans.filter(loan =>
            loan.status === 'ACTIVE' || loan.status === 'OVERDUE'
        );

        if (activeLoans.length === 0) {
            select.innerHTML = '<option value="">No active loans found</option>';
            return;
        }

        select.innerHTML = `
            <option value="">Select Loan Account</option>
            ${activeLoans.map(loan => `
                <option value="${loan.id}">
                    Loan ${loan.id.slice(0, 8)} - ${Utils.formatCurrency(loan.total_amount_due || loan.amount_due)} (${loan.status})
                </option>
            `).join('')}
        `;
    }

    async handleRepayment(e) {
        e.preventDefault();
        console.log('🟡 Handling repayment...');

        const submitBtn = document.getElementById('submit-repayment');

        try {
            Utils.setButtonLoading(submitBtn, true, 'Processing...');

            // Clear previous errors
            this.clearRepaymentErrors();

            const phoneNumber = document.getElementById('repayment-phone').value;
            const amount = parseFloat(document.getElementById('repayment-amount').value);
            const loanAccount = document.getElementById('loan-account').value;

            // Validation
            if (!Utils.validatePhoneNumber(phoneNumber)) {
                this.showRepaymentError('phone-error', 'Please enter a valid Kenyan phone number');
                return;
            }

            if (amount < 100 || amount > 50000) {
                this.showRepaymentError('amount-error', 'Amount must be between KES 100 and KES 50,000');
                return;
            }

            if (!loanAccount) {
                this.showRepaymentError('loan-error', 'Please select a loan account');
                return;
            }

            console.log('🟡 Repayment data:', { phoneNumber, amount, loanAccount });

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.MPESA.INITIATE_REPAYMENT, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    amount: amount,
                    loan_id: loanAccount
                })
            });

            console.log('📡 Repayment response status:', response.status);

            const data = await response.json();
            console.log('📡 Repayment response:', data);

            if (response.ok && data.success) {
                Utils.showAlert('Payment request sent to your phone! Please check for STK Push prompt.', 'success');
                document.getElementById('repayment-form').reset();
            } else {
                throw new Error(data.message || data.detail || 'Failed to initiate payment');
            }
        } catch (error) {
            console.error('❌ Error initiating repayment:', error);
            Utils.showAlert(`Failed to initiate payment: ${error.message}`, 'error');
        } finally {
            Utils.setButtonLoading(submitBtn, false);
        }
    }

    clearRepaymentErrors() {
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    showRepaymentError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    exportData() {
        Utils.showAlert('Export feature coming soon!', 'info');
    }
}

// Add CSS for M-Pesa components
const mpesaStyle = document.createElement('style');
mpesaStyle.textContent = `
    .quick-actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .quick-action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.5rem 1rem;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
    }

    .quick-action-btn:hover {
        border-color: var(--primary-color);
        background: #f8f9fa;
        transform: translateY(-2px);
    }

    .action-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    .action-text {
        font-weight: 600;
        color: var(--text-color);
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .metric-card {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        transition: transform 0.2s ease;
    }

    .metric-card:hover {
        transform: translateY(-2px);
    }

    .metric-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .metric-label {
        color: var(--text-light);
        font-size: 0.875rem;
    }

    .health-score-display {
        text-align: center;
    }

    .score-chart-container {
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto 1rem;
    }

    .score-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
    }

    .score-value {
        font-size: 2rem;
        font-weight: bold;
    }

    .score-label {
        font-size: 0.875rem;
        color: var(--text-light);
    }

    .score-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .score-subtitle {
        color: var(--text-light);
        font-size: 0.9rem;
    }

    .analysis-details {
        space-y: 0.75rem;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-color);
    }

    .detail-item:last-child {
        border-bottom: none;
    }

    .transaction-type {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .type-c2b {
        background: #d4edda;
        color: #155724;
    }

    .type-c2c {
        background: #d1ecf1;
        color: #0c5460;
    }

    .type-b2c {
        background: #fff3cd;
        color: #856404;
    }

    .type-payment {
        background: #e2e3e5;
        color: #383d41;
    }

    .amount-cell {
        font-weight: 600;
        color: var(--primary-color);
    }

    .instructions {
        space-y: 1rem;
    }

    .instruction-steps {
        margin-left: 1rem;
        margin-top: 1rem;
    }

    .instruction-steps li {
        margin-bottom: 0.5rem;
    }

    .important-notes {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 6px;
        margin-top: 1rem;
    }

    .important-notes ul {
        margin-left: 1rem;
        margin-top: 0.5rem;
    }

    .important-notes li {
        margin-bottom: 0.25rem;
    }

    .card-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .filter-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .table-footer {
        text-align: center;
        padding: 1rem;
        color: var(--text-light);
        font-size: 0.9rem;
    }

    @media (max-width: 768px) {
        .metrics-grid {
            grid-template-columns: 1fr;
        }

        .quick-actions-grid {
            grid-template-columns: 1fr;
        }

        .card-header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
        }

        .filter-control {
            justify-content: center;
        }
    }
`;
document.head.appendChild(mpesaStyle);

// Create global instance
window.mpesaManager = new MpesaManager();