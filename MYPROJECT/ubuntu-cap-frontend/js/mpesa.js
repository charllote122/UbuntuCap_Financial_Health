// M-Pesa Integration Management
class MpesaManager {
    constructor() {
        this.currentView = 'profile';
        this.init();
    }

    init() {
        // M-Pesa manager ready
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
                        <div>
                            <button class="btn btn-secondary" id="back-to-dashboard">
                                Back to Dashboard
                            </button>
                            <button class="btn btn-primary" id="refresh-analysis">
                                Refresh Analysis
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-8">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Financial Overview</h3>
                                </div>
                                <div id="financial-overview">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading your financial profile...</p>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Quick Actions</h3>
                                </div>
                                <div class="quick-actions">
                                    <div class="action-btn" data-action="transactions">
                                        <div class="action-icon">📊</div>
                                        <div>Transaction History</div>
                                    </div>
                                    <div class="action-btn" data-action="repayment">
                                        <div class="action-icon">💳</div>
                                        <div>Make Repayment</div>
                                    </div>
                                    <div class="action-btn" data-action="simulate">
                                        <div class="action-icon">🔄</div>
                                        <div>Simulate Data</div>
                                    </div>
                                    <div class="action-btn" data-action="export">
                                        <div class="action-icon">📤</div>
                                        <div>Export Data</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Financial Health Score</h3>
                                </div>
                                <div id="health-score" style="text-align: center; padding: 2rem;">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Calculating score...</p>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Analysis Details</h3>
                                </div>
                                <div id="analysis-details">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading analysis...</p>
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
                        <div>
                            <button class="btn btn-secondary" id="back-to-profile">
                                Back to Profile
                            </button>
                            <button class="btn btn-primary" id="simulate-transactions">
                                Simulate Transactions
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header" style="display: flex; justify-content: between; align-items: center;">
                                    <h3 class="card-title">Recent Transactions</h3>
                                    <div>
                                        <select id="transaction-filter" class="form-control" style="width: auto; display: inline-block;">
                                            <option value="all">All Transactions</option>
                                            <option value="C2B">Income</option>
                                            <option value="C2C">Transfers</option>
                                            <option value="PAYMENT">Payments</option>
                                        </select>
                                    </div>
                                </div>
                                <div id="transactions-list">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading your transactions...</p>
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
                        <div>
                            <button class="btn btn-secondary" id="back-to-profile">
                                Back to Profile
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-6">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Initiate Repayment</h3>
                                </div>
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
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">Loan Account</label>
                                        <select class="form-control" id="loan-account" required>
                                            <option value="">Select Loan Account</option>
                                            <!-- Loans will be populated dynamically -->
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label style="display: flex; align-items: flex-start; cursor: pointer;">
                                            <input type="checkbox" style="margin-right: 0.5rem; margin-top: 0.25rem;" required>
                                            <span>
                                                I authorize UbuntuCap to initiate an M-Pesa payment request 
                                                for the specified amount. Standard M-Pesa charges apply.
                                            </span>
                                        </label>
                                    </div>

                                    <button type="submit" class="btn btn-primary" id="submit-repayment">
                                        Initiate M-Pesa Payment
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div class="col-6">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Payment Instructions</h3>
                                </div>
                                <div style="padding: 1rem;">
                                    <h4>How to complete your payment:</h4>
                                    <ol style="margin-left: 1rem; margin-top: 1rem;">
                                        <li>Click "Initiate M-Pesa Payment"</li>
                                        <li>Check your phone for STK Push prompt</li>
                                        <li>Enter your M-Pesa PIN when prompted</li>
                                        <li>Wait for confirmation message</li>
                                        <li>Payment will reflect immediately</li>
                                    </ol>

                                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
                                        <h5>Important Notes:</h5>
                                        <ul style="margin-left: 1rem;">
                                            <li>Ensure sufficient balance in your M-Pesa account</li>
                                            <li>Keep your phone nearby during the process</li>
                                            <li>Standard M-Pesa transaction fees apply</li>
                                            <li>Contact support if you encounter any issues</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Recent Repayments</h3>
                                </div>
                                <div id="recent-repayments">
                                    <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                                        <p>No recent repayments found</p>
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
            const response = await fetch(API_CONFIG.BASE_URL + '/mpesa/profile/', {
                headers: {
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            const data = await response.json();

            if (data.success) {
                this.renderMpesaProfile(data.profile);
                this.attachMpesaProfileEventListeners();
            } else {
                this.showNoDataState();
            }
        } catch (error) {
            console.error('Error loading M-Pesa profile:', error);
            this.showNoDataState();
        }
    }

    renderMpesaProfile(profile) {
        // Financial Overview
        document.getElementById('financial-overview').innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div class="metric-card">
                    <div class="metric-value">${profile.average_weekly_income ? Utils.formatCurrency(profile.average_weekly_income) : 'N/A'}</div>
                    <div class="metric-label">Average Weekly Income</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${profile.average_weekly_expenses ? Utils.formatCurrency(profile.average_weekly_expenses) : 'N/A'}</div>
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
                    <div class="metric-value">${profile.total_volume ? Utils.formatCurrency(profile.total_volume) : 'N/A'}</div>
                    <div class="metric-label">Total Volume</div>
                </div>
            </div>
        `;

        // Health Score
        const consistency = profile.transaction_consistency ? parseFloat(profile.transaction_consistency) : 0;
        const savingsHabit = profile.has_savings_habit ? 1 : 0;
        const fulizaRatio = profile.fuliza_repayment_ratio ? parseFloat(profile.fuliza_repayment_ratio) : 1;

        const healthScore = Math.round((consistency * 0.4 + savingsHabit * 0.3 + fulizaRatio * 0.3) * 100);

        document.getElementById('health-score').innerHTML = `
            <div style="position: relative; width: 150px; height: 150px; margin: 0 auto;">
                <canvas id="health-score-chart" width="150" height="150"></canvas>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: ${this.getScoreColor(healthScore)};">${healthScore}</div>
                    <div style="font-size: 0.875rem; color: #7f8c8d;">Score</div>
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <div style="font-size: 1.1rem; font-weight: 600;">${this.getScoreDescription(healthScore)}</div>
                <div style="color: #7f8c8d; margin-top: 0.5rem;">Based on transaction analysis</div>
            </div>
        `;

        this.renderHealthScoreChart(healthScore);

        // Analysis Details
        document.getElementById('analysis-details').innerHTML = `
            <div style="space-y-2">
                <div style="display: flex; justify-content: between; margin-bottom: 0.5rem;">
                    <span>Transaction Consistency:</span>
                    <span><strong>${Math.round(consistency * 100)}%</strong></span>
                </div>
                <div style="display: flex; justify-content: between; margin-bottom: 0.5rem;">
                    <span>Savings Habit:</span>
                    <span><strong>${savingsHabit ? 'Yes' : 'No'}</strong></span>
                </div>
                <div style="display: flex; justify-content: between; margin-bottom: 0.5rem;">
                    <span>Fuliza Repayment:</span>
                    <span><strong>${fulizaRatio ? Math.round(fulizaRatio * 100) + '%' : 'N/A'}</strong></span>
                </div>
                <div style="display: flex; justify-content: between; margin-bottom: 0.5rem;">
                    <span>Last Analysis:</span>
                    <span><strong>${profile.last_analysis ? new Date(profile.last_analysis).toLocaleDateString() : 'Never'}</strong></span>
                </div>
            </div>
        `;
    }

    renderHealthScoreChart(score) {
        const canvas = document.getElementById('health-score-chart');
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
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📊</div>
                <h3>No Transaction Data Available</h3>
                <p style="color: #7f8c8d; margin-bottom: 2rem;">
                    We need M-Pesa transaction data to generate your financial profile.
                </p>
                <button class="btn btn-primary" id="simulate-data-btn">
                    Simulate Sample Data
                </button>
            </div>
        `;

        document.getElementById('health-score').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                <p>No data available for analysis</p>
            </div>
        `;

        document.getElementById('analysis-details').innerHTML = `
            <div style="text-align: center; padding: 1rem; color: #7f8c8d;">
                <p>Complete analysis will appear here once data is available</p>
            </div>
        `;
    }

    attachMpesaProfileEventListeners() {
        const backButton = document.getElementById('back-to-dashboard');
        const refreshButton = document.getElementById('refresh-analysis');
        const actionButtons = document.querySelectorAll('.action-btn');
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

            const response = await fetch(API_CONFIG.BASE_URL + '/mpesa/analyze-transactions/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            const data = await response.json();

            if (data.success) {
                Utils.showAlert('Analysis refreshed successfully!', 'success');
                this.loadMpesaProfile();
            } else {
                Utils.showAlert(data.message || 'Failed to refresh analysis', 'error');
            }
        } catch (error) {
            console.error('Error refreshing analysis:', error);
            Utils.showAlert('Failed to refresh analysis', 'error');
        }
    }

    async simulateTransactionData() {
        try {
            Utils.showAlert('Generating sample transaction data...', 'info');

            const response = await fetch(API_CONFIG.BASE_URL + '/mpesa/simulate-transactions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                },
                body: JSON.stringify({ months: 6 })
            });

            const data = await response.json();

            if (data.success) {
                Utils.showAlert(`Successfully generated ${data.transactions_created} sample transactions!`, 'success');
                // Refresh the profile to show new data
                setTimeout(() => {
                    this.refreshAnalysis();
                }, 1000);
            } else {
                Utils.showAlert(data.message || 'Failed to generate sample data', 'error');
            }
        } catch (error) {
            console.error('Error simulating transaction data:', error);
            Utils.showAlert('Failed to generate sample data', 'error');
        }
    }

    async loadTransactionHistory() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + '/mpesa/transaction-history/', {
                headers: {
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            const data = await response.json();

            if (data.success) {
                this.renderTransactionHistory(data.transactions);
                this.attachTransactionHistoryEventListeners();
            } else {
                this.showNoTransactionsState();
            }
        } catch (error) {
            console.error('Error loading transaction history:', error);
            this.showNoTransactionsState();
        }
    }

    renderTransactionHistory(transactions) {
        const container = document.getElementById('transactions-list');

        if (!transactions || transactions.length === 0) {
            this.showNoTransactionsState();
            return;
        }

        container.innerHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e1e8ed;">Date</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e1e8ed;">Type</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e1e8ed;">Amount</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e1e8ed;">Counterparty</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e1e8ed;">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(transaction => `
                            <tr style="border-bottom: 1px solid #e1e8ed;">
                                <td style="padding: 0.75rem;">
                                    ${new Date(transaction.transaction_date).toLocaleDateString()}
                                </td>
                                <td style="padding: 0.75rem;">
                                    <span class="transaction-type type-${transaction.type.toLowerCase()}">
                                        ${transaction.type}
                                    </span>
                                </td>
                                <td style="padding: 0.75rem; font-weight: 600;">
                                    ${Utils.formatCurrency(transaction.amount)}
                                </td>
                                <td style="padding: 0.75rem;">
                                    ${transaction.counterparty || 'N/A'}
                                </td>
                                <td style="padding: 0.75rem;">
                                    ${transaction.description || 'No description'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="text-align: center; padding: 1rem; color: #7f8c8d;">
                Showing ${transactions.length} most recent transactions
            </div>
        `;
    }

    showNoTransactionsState() {
        document.getElementById('transactions-list').innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">💳</div>
                <h3>No Transactions Found</h3>
                <p style="color: #7f8c8d; margin-bottom: 2rem;">
                    You don't have any M-Pesa transactions recorded yet.
                </p>
                <button class="btn btn-primary" id="simulate-transactions-btn">
                    Generate Sample Transactions
                </button>
            </div>
        `;
    }

    attachTransactionHistoryEventListeners() {
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
        // Implement transaction filtering
        Utils.showAlert(`Filtering transactions by: ${filter}`, 'info');
    }

    attachRepaymentEventListeners() {
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
            const response = await fetch(API_CONFIG.BASE_URL + '/loans/my-loans/', {
                headers: {
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            const data = await response.json();

            if (data.success) {
                this.populateLoanAccounts(data.loans);
            }
        } catch (error) {
            console.error('Error loading user loans:', error);
        }
    }

    populateLoanAccounts(loans) {
        const select = document.getElementById('loan-account');

        if (!loans || loans.length === 0) {
            select.innerHTML = '<option value="">No active loans found</option>';
            return;
        }

        select.innerHTML = `
            <option value="">Select Loan Account</option>
            ${loans.filter(loan => loan.status === 'ACTIVE' || loan.status === 'OVERDUE').map(loan => `
                <option value="${loan.id}">
                    Loan ${loan.id.slice(0, 8)} - ${Utils.formatCurrency(loan.total_amount_due)} (${loan.status})
                </option>
            `).join('')}
        `;
    }

    async handleRepayment(e) {
        e.preventDefault();

        const phoneNumber = document.getElementById('repayment-phone').value;
        const amount = document.getElementById('repayment-amount').value;
        const loanAccount = document.getElementById('loan-account').value;

        if (!Utils.validatePhoneNumber(phoneNumber)) {
            Utils.showAlert('Please enter a valid Kenyan phone number', 'error');
            return;
        }

        if (amount < 100 || amount > 50000) {
            Utils.showAlert('Amount must be between KES 100 and KES 50,000', 'error');
            return;
        }

        if (!loanAccount) {
            Utils.showAlert('Please select a loan account', 'error');
            return;
        }

        try {
            const submitBtn = document.getElementById('submit-repayment');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';

            const response = await fetch(API_CONFIG.BASE_URL + '/mpesa/initiate-repayment/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    amount: parseFloat(amount)
                })
            });

            const data = await response.json();

            if (data.success) {
                Utils.showAlert('Payment request sent to your phone! Please check for STK Push prompt.', 'success');
                // Reset form
                document.getElementById('repayment-form').reset();
            } else {
                Utils.showAlert(data.message || 'Failed to initiate payment', 'error');
            }
        } catch (error) {
            console.error('Error initiating repayment:', error);
            Utils.showAlert('Failed to initiate payment. Please try again.', 'error');
        } finally {
            const submitBtn = document.getElementById('submit-repayment');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Initiate M-Pesa Payment';
        }
    }

    exportData() {
        Utils.showAlert('Export feature coming soon!', 'info');
    }
}

// Add CSS for transaction types and metrics
const mpesaStyle = document.createElement('style');
mpesaStyle.textContent = `
    .metric-card {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
    }
    
    .metric-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    .metric-label {
        color: #7f8c8d;
        font-size: 0.875rem;
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
`;
document.head.appendChild(mpesaStyle);