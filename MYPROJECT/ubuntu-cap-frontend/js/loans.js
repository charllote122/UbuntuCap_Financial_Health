// Loans Management
class LoansManager {
    constructor() {
        this.currentView = 'application';
        this.selectedLoan = null;
        this.init();
    }

    init() {
        console.log('🟡 LoansManager initialized');
    }

    showLoanApplication() {
        this.currentView = 'application';
        this.renderLoanView();
    }

    showLoansList() {
        this.currentView = 'list';
        this.renderLoanView();
    }

    showLoanDetails(loanId) {
        this.currentView = 'details';
        this.selectedLoan = loanId;
        this.renderLoanView();
    }

    async renderLoanView() {
        const mainContent = document.getElementById('main-content');

        try {
            switch (this.currentView) {
                case 'application':
                    mainContent.innerHTML = this.getLoanApplicationHTML();
                    this.attachLoanApplicationEventListeners();
                    break;
                case 'list':
                    mainContent.innerHTML = this.getLoansListHTML();
                    await this.loadUserLoans();
                    break;
                case 'details':
                    if (!this.selectedLoan) {
                        throw new Error('No loan selected');
                    }
                    mainContent.innerHTML = this.getLoanDetailsHTML();
                    await this.loadLoanDetails();
                    break;
            }
        } catch (error) {
            console.error('❌ Error rendering loan view:', error);
            Utils.showAlert(`Failed to load loans: ${error.message}`, 'error');
        }
    }

    getLoanApplicationHTML() {
        return `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>Apply for a Loan</h1>
                            <p>Get the financial support you need</p>
                        </div>
                        <div class="dashboard-actions">
                            <button class="btn btn-secondary" id="back-to-dashboard">
                                ← Back to Dashboard
                            </button>
                            <button class="btn btn-outline" id="view-my-loans">
                                📋 My Loans
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-8">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Loan Application</h3>
                                </div>
                                <div class="card-body">
                                    <form id="loan-application-form">
                                        <div class="form-group">
                                            <label class="form-label">Loan Amount (KES) *</label>
                                            <input type="number" class="form-control" 
                                                   name="amount" min="500" max="50000" 
                                                   placeholder="Enter amount between 500 and 50,000" 
                                                   required value="5000">
                                            <div class="form-help">
                                                Minimum: KES 500, Maximum: KES 50,000
                                            </div>
                                            <div class="form-error" id="amount-error"></div>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">Repayment Period (Days) *</label>
                                            <select class="form-control" name="requested_term" required>
                                                <option value="">Select Period</option>
                                                <option value="30">30 Days</option>
                                                <option value="60">60 Days</option>
                                                <option value="90" selected>90 Days</option>
                                                <option value="180">180 Days</option>
                                            </select>
                                            <div class="form-error" id="term-error"></div>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">Loan Purpose *</label>
                                            <select class="form-control" name="purpose" required>
                                                <option value="">Select Purpose</option>
                                                <option value="BUSINESS">Business Expansion</option>
                                                <option value="EDUCATION">Education Fees</option>
                                                <option value="EMERGENCY">Emergency</option>
                                                <option value="HEALTH">Medical/Health</option>
                                                <option value="HOME">Home Improvement</option>
                                                <option value="AGRICULTURE">Agriculture</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                            <div class="form-error" id="purpose-error"></div>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">Additional Notes (Optional)</label>
                                            <textarea class="form-control" name="notes" 
                                                      rows="3" placeholder="Any additional information about your loan request..."></textarea>
                                        </div>

                                        <div class="form-group">
                                            <label class="consent-label">
                                                <input type="checkbox" required>
                                                <span class="consent-text">
                                                    I agree to the <a href="#" style="color: #3498db;">Terms and Conditions</a> 
                                                    and confirm that all information provided is accurate. I understand that 
                                                    loan approval is subject to credit assessment.
                                                </span>
                                            </label>
                                            <div class="form-error" id="consent-error"></div>
                                        </div>

                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-primary" id="submit-loan-btn">
                                                📨 Submit Application
                                            </button>
                                            <button type="button" class="btn btn-outline" id="cancel-loan-btn">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">💡 Loan Details</h3>
                                </div>
                                <div class="card-body">
                                    <div class="info-item">
                                        <strong>Interest Rate:</strong> 12% per annum
                                    </div>
                                    <div class="info-item">
                                        <strong>Processing Fee:</strong> 2% of loan amount
                                    </div>
                                    <div class="info-item">
                                        <strong>Late Payment Fee:</strong> 5% of installment
                                    </div>
                                    <div class="info-item">
                                        <strong>Disbursement:</strong> Within 24 hours
                                    </div>
                                    <div class="info-item">
                                        <strong>Early Repayment:</strong> No penalties
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">🧮 Repayment Calculator</h3>
                                </div>
                                <div class="card-body">
                                    <div class="form-group">
                                        <label class="form-label">Loan Amount</label>
                                        <input type="number" class="form-control" id="calc-amount" 
                                               placeholder="Enter amount" value="5000">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Period (Days)</label>
                                        <select class="form-control" id="calc-period">
                                            <option value="30">30 Days</option>
                                            <option value="60">60 Days</option>
                                            <option value="90" selected>90 Days</option>
                                            <option value="180">180 Days</option>
                                        </select>
                                    </div>
                                    <div id="calc-result" class="calculator-result">
                                        <div class="calc-line">
                                            <strong>Total Interest:</strong> 
                                            <span id="total-interest">-</span>
                                        </div>
                                        <div class="calc-line">
                                            <strong>Total Repayment:</strong> 
                                            <span id="total-repayment">-</span>
                                        </div>
                                        <div class="calc-line">
                                            <strong>Processing Fee:</strong> 
                                            <span id="processing-fee">-</span>
                                        </div>
                                        <div class="calc-line total">
                                            <strong>Amount Received:</strong> 
                                            <span id="amount-received">-</span>
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

    getLoansListHTML() {
        return `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>My Loans</h1>
                            <p>View and manage your loan applications</p>
                        </div>
                        <div class="dashboard-actions">
                            <button class="btn btn-secondary" id="back-to-dashboard">
                                ← Back to Dashboard
                            </button>
                            <button class="btn btn-primary" id="apply-new-loan">
                                ➕ Apply for New Loan
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">📋 Loan Applications</h3>
                                </div>
                                <div class="card-body">
                                    <div id="applications-list">
                                        <div class="loading-state">
                                            <div class="loading-spinner"></div>
                                            <p>Loading your loan applications...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">💰 Active Loans</h3>
                                </div>
                                <div class="card-body">
                                    <div id="loans-list">
                                        <div class="loading-state">
                                            <div class="loading-spinner"></div>
                                            <p>Loading your active loans...</p>
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

    getLoanDetailsHTML() {
        return `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>Loan Details</h1>
                            <p>Detailed information about your loan</p>
                        </div>
                        <div class="dashboard-actions">
                            <button class="btn btn-secondary" id="back-to-loans">
                                ← Back to My Loans
                            </button>
                            <button class="btn btn-primary" id="make-repayment-btn" style="display: none;">
                                💳 Make Repayment
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-8">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">📊 Loan Information</h3>
                                </div>
                                <div class="card-body">
                                    <div id="loan-info">
                                        <div class="loading-state">
                                            <div class="loading-spinner"></div>
                                            <p>Loading loan details...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">📈 Repayment History</h3>
                                </div>
                                <div class="card-body">
                                    <div id="repayment-history">
                                        <div class="loading-state">
                                            <div class="loading-spinner"></div>
                                            <p>Loading repayment history...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">⚡ Quick Actions</h3>
                                </div>
                                <div class="card-body">
                                    <button class="btn btn-outline action-btn" id="view-loan-statement">
                                        📄 Download Statement
                                    </button>
                                    <button class="btn btn-outline action-btn" id="contact-support">
                                        📞 Contact Support
                                    </button>
                                    <button class="btn btn-outline action-btn" id="extend-loan">
                                        📅 Request Extension
                                    </button>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">💰 Repayment Summary</h3>
                                </div>
                                <div class="card-body">
                                    <div id="repayment-summary">
                                        <div class="loading-state">
                                            <div class="loading-spinner"></div>
                                            <p>Loading summary...</p>
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

    attachLoanApplicationEventListeners() {
        console.log('🟡 Attaching loan application event listeners...');

        const loanForm = document.getElementById('loan-application-form');
        const backButton = document.getElementById('back-to-dashboard');
        const viewLoansButton = document.getElementById('view-my-loans');
        const cancelButton = document.getElementById('cancel-loan-btn');
        const calcAmount = document.getElementById('calc-amount');
        const calcPeriod = document.getElementById('calc-period');

        if (loanForm) {
            loanForm.addEventListener('submit', (e) => this.handleLoanApplication(e));
        }

        if (backButton) {
            backButton.addEventListener('click', () => {
                window.dashboardManager.loadDashboard();
            });
        }

        if (viewLoansButton) {
            viewLoansButton.addEventListener('click', () => {
                this.showLoansList();
            });
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                window.dashboardManager.loadDashboard();
            });
        }

        if (calcAmount && calcPeriod) {
            calcAmount.addEventListener('input', () => this.updateCalculator());
            calcPeriod.addEventListener('change', () => this.updateCalculator());
        }

        this.updateCalculator();
    }

    updateCalculator() {
        const amount = parseFloat(document.getElementById('calc-amount').value) || 0;
        const period = parseInt(document.getElementById('calc-period').value) || 90;

        if (amount > 0) {
            const annualInterestRate = 0.12;
            const dailyInterestRate = annualInterestRate / 365;
            const interest = amount * dailyInterestRate * period;
            const processingFee = amount * 0.02;
            const totalRepayment = amount + interest;
            const amountReceived = amount - processingFee;

            document.getElementById('total-interest').textContent = Utils.formatCurrency(interest);
            document.getElementById('total-repayment').textContent = Utils.formatCurrency(totalRepayment);
            document.getElementById('processing-fee').textContent = Utils.formatCurrency(processingFee);
            document.getElementById('amount-received').textContent = Utils.formatCurrency(amountReceived);
        }
    }

    async handleLoanApplication(e) {
        e.preventDefault();
        console.log('🟡 Submitting loan application...');

        const submitButton = document.getElementById('submit-loan-btn');

        try {
            Utils.setButtonLoading(submitButton, true, 'Submitting...');

            // Clear previous errors
            this.clearFormErrors();

            const formData = new FormData(e.target);
            const data = {
                amount: parseFloat(formData.get('amount')),
                requested_term: parseInt(formData.get('requested_term')),
                purpose: formData.get('purpose'),
                notes: formData.get('notes') || ''
            };

            // Validation
            if (data.amount < 500 || data.amount > 50000) {
                throw new Error('Loan amount must be between KES 500 and KES 50,000');
            }

            if (!data.requested_term) {
                throw new Error('Please select a repayment period');
            }

            if (!data.purpose) {
                throw new Error('Please select a loan purpose');
            }

            console.log('🟡 Loan application data:', data);

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOANS.APPLICATIONS.SUBMIT, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                },
                body: JSON.stringify(data)
            });

            console.log('📡 Loan application response status:', response.status);

            const result = await response.json();
            console.log('📡 Loan application response:', result);

            if (response.ok && result.success) {
                Utils.showAlert('Loan application submitted successfully!', 'success');
                this.showLoansList();
            } else {
                // Show form errors
                if (result.errors) {
                    this.displayFormErrors(result.errors);
                } else {
                    throw new Error(result.message || result.detail || 'Loan application failed');
                }
            }
        } catch (error) {
            console.error('❌ Loan application error:', error);
            Utils.showAlert(`Application failed: ${error.message}`, 'error');
        } finally {
            Utils.setButtonLoading(submitButton, false);
        }
    }

    clearFormErrors() {
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    displayFormErrors(errors) {
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            if (errorElement) {
                const errorMessage = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            }
        });
    }

    async loadUserLoans() {
        try {
            console.log('🟡 Loading user loans...');
            Utils.showLoading('Loading your loans...');

            // Try different endpoints with fallbacks
            const endpoints = [
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOANS.USER_LOANS,
                API_CONFIG.BASE_URL + '/loans/my-loans/',
                API_CONFIG.BASE_URL + '/loans/applications/'
            ];

            let loansData = null;
            let applicationsData = null;

            // Try to load user loans
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        credentials: 'include',
                        headers: {
                            'X-CSRFToken': Utils.getCSRFToken()
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('📡 Loans data from', endpoint, ':', data);

                        if (data.loans || data.applications) {
                            loansData = data;
                            break;
                        }
                    }
                } catch (error) {
                    console.log(`Endpoint ${endpoint} failed:`, error.message);
                    continue;
                }
            }

            this.renderApplicationsList(applicationsData || { applications: [] });
            this.renderLoansList(loansData || { loans: [] });
            this.attachLoansListEventListeners();

        } catch (error) {
            console.error('❌ Error loading user loans:', error);
            Utils.showAlert('Failed to load loan data. Please try again.', 'error');

            // Show empty state
            this.renderApplicationsList({ applications: [] });
            this.renderLoansList({ loans: [] });
            this.attachLoansListEventListeners();
        } finally {
            Utils.hideLoading();
        }
    }

    renderApplicationsList(data) {
        const container = document.getElementById('applications-list');

        if (!data.applications || data.applications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No Loan Applications</h3>
                    <p>You haven't applied for any loans yet.</p>
                    <button class="btn btn-primary" id="apply-first-loan">
                        Apply for Your First Loan
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = data.applications.map(app => `
            <div class="loan-item" data-id="${app.id}">
                <div class="loan-item-content">
                    <div class="loan-info">
                        <h4 class="loan-amount">${Utils.formatCurrency(app.requested_amount || app.amount)}</h4>
                        <p class="loan-meta">
                            Applied: ${new Date(app.created_at).toLocaleDateString()} • 
                            Term: ${app.requested_term || app.term} days
                        </p>
                        <p class="loan-purpose">${app.purpose || 'No purpose specified'}</p>
                    </div>
                    <div class="loan-status">
                        <span class="status-badge status-${(app.status || '').toLowerCase()}">
                            ${(app.status || 'PENDING').replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderLoansList(data) {
        const container = document.getElementById('loans-list');

        if (!data.loans || data.loans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💰</div>
                    <h3>No Active Loans</h3>
                    <p>You don't have any active loans at the moment.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.loans.map(loan => `
            <div class="loan-item" data-id="${loan.id}">
                <div class="loan-item-content">
                    <div class="loan-info">
                        <h4 class="loan-amount">${Utils.formatCurrency(loan.principal_amount || loan.amount)}</h4>
                        <p class="loan-meta">
                            ${loan.disbursed_at ? `Disbursed: ${new Date(loan.disbursed_at).toLocaleDateString()} • ` : ''}
                            ${loan.due_date ? `Due: ${new Date(loan.due_date).toLocaleDateString()}` : 'Not disbursed'}
                        </p>
                        ${loan.days_remaining !== undefined ? `
                            <p class="loan-days">${loan.days_remaining} days remaining</p>
                        ` : ''}
                    </div>
                    <div class="loan-status">
                        <span class="status-badge status-${(loan.status || '').toLowerCase()}">
                            ${loan.status || 'ACTIVE'}
                        </span>
                        ${loan.is_overdue ? `
                            <p class="overdue-warning">OVERDUE</p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    attachLoansListEventListeners() {
        console.log('🟡 Attaching loans list event listeners...');

        const backButton = document.getElementById('back-to-dashboard');
        const applyButton = document.getElementById('apply-new-loan');
        const applyFirstButton = document.getElementById('apply-first-loan');
        const loanItems = document.querySelectorAll('.loan-item[data-id]');

        if (backButton) {
            backButton.addEventListener('click', () => {
                window.dashboardManager.loadDashboard();
            });
        }

        if (applyButton) {
            applyButton.addEventListener('click', () => {
                this.showLoanApplication();
            });
        }

        if (applyFirstButton) {
            applyFirstButton.addEventListener('click', () => {
                this.showLoanApplication();
            });
        }

        loanItems.forEach(item => {
            item.addEventListener('click', () => {
                const loanId = item.dataset.id;
                this.showLoanDetails(loanId);
            });
        });
    }

    async loadLoanDetails() {
        try {
            console.log('🟡 Loading loan details for:', this.selectedLoan);
            Utils.showLoading('Loading loan details...');

            // Try different endpoint patterns
            const endpoints = [
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOANS.LOAN_DETAIL + this.selectedLoan + '/',
                API_CONFIG.BASE_URL + '/loans/my-loans/' + this.selectedLoan + '/',
                API_CONFIG.BASE_URL + '/loans/' + this.selectedLoan + '/'
            ];

            let loanData = null;

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        credentials: 'include',
                        headers: {
                            'X-CSRFToken': Utils.getCSRFToken()
                        }
                    });

                    if (response.ok) {
                        loanData = await response.json();
                        console.log('📡 Loan details from', endpoint, ':', loanData);
                        break;
                    }
                } catch (error) {
                    console.log(`Endpoint ${endpoint} failed:`, error.message);
                    continue;
                }
            }

            if (loanData) {
                this.renderLoanDetails(loanData);
                this.attachLoanDetailsEventListeners();
            } else {
                throw new Error('Could not load loan details from any endpoint');
            }

        } catch (error) {
            console.error('❌ Error loading loan details:', error);
            Utils.showAlert('Failed to load loan details. Please try again.', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    renderLoanDetails(data) {
        const loan = data.loan || data;

        // Loan Information
        document.getElementById('loan-info').innerHTML = `
            <div class="loan-details-grid">
                <div class="detail-item">
                    <strong>Principal Amount:</strong>
                    <span>${Utils.formatCurrency(loan.principal_amount || loan.amount)}</span>
                </div>
                <div class="detail-item">
                    <strong>Interest Rate:</strong>
                    <span>${loan.interest_rate || '12'}%</span>
                </div>
                <div class="detail-item">
                    <strong>Total Amount Due:</strong>
                    <span>${Utils.formatCurrency(loan.total_amount_due || loan.amount_due)}</span>
                </div>
                <div class="detail-item">
                    <strong>Amount Disbursed:</strong>
                    <span>${Utils.formatCurrency(loan.amount_disbursed || loan.disbursed_amount)}</span>
                </div>
                <div class="detail-item">
                    <strong>Disbursement Date:</strong>
                    <span>${loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString() : 'Not disbursed'}</span>
                </div>
                <div class="detail-item">
                    <strong>Due Date:</strong>
                    <span>${loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Status:</strong>
                    <span><span class="status-badge status-${(loan.status || '').toLowerCase()}">${loan.status || 'ACTIVE'}</span></span>
                </div>
                <div class="detail-item">
                    <strong>Days Remaining:</strong>
                    <span>${loan.days_remaining !== undefined ? loan.days_remaining + ' days' : 'N/A'}</span>
                </div>
            </div>
        `;

        // Repayment Summary
        document.getElementById('repayment-summary').innerHTML = `
            <div class="repayment-summary">
                <div class="remaining-balance">
                    ${Utils.formatCurrency(loan.remaining_balance || loan.outstanding_balance || 0)}
                </div>
                <div class="balance-label">Remaining Balance</div>
                
                <div class="repayment-breakdown">
                    <div class="breakdown-item">
                        <span>Total Repaid:</span>
                        <span>${Utils.formatCurrency(loan.total_repaid || 0)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span>Original Amount:</span>
                        <span>${Utils.formatCurrency(loan.principal_amount || loan.amount)}</span>
                    </div>
                    <div class="breakdown-item total">
                        <span>Total Due:</span>
                        <span>${Utils.formatCurrency(loan.total_amount_due || loan.amount_due)}</span>
                    </div>
                </div>
            </div>
        `;

        // Repayment History
        const history = data.repayment_history || [];
        if (history.length > 0) {
            document.getElementById('repayment-history').innerHTML = `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${history.map(repayment => `
                                <tr>
                                    <td>${new Date(repayment.paid_at || repayment.date).toLocaleDateString()}</td>
                                    <td>${Utils.formatCurrency(repayment.amount)}</td>
                                    <td>${repayment.payment_method || 'M-Pesa'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            document.getElementById('repayment-history').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📈</div>
                    <p>No repayment history found.</p>
                </div>
            `;
        }

        // Show make repayment button for active/overdue loans
        const makeRepaymentBtn = document.getElementById('make-repayment-btn');
        if (['ACTIVE', 'OVERDUE'].includes(loan.status)) {
            makeRepaymentBtn.style.display = 'block';
        }
    }

    attachLoanDetailsEventListeners() {
        console.log('🟡 Attaching loan details event listeners...');

        const backButton = document.getElementById('back-to-loans');
        const makeRepaymentBtn = document.getElementById('make-repayment-btn');
        const viewStatementBtn = document.getElementById('view-loan-statement');
        const contactSupportBtn = document.getElementById('contact-support');
        const extendLoanBtn = document.getElementById('extend-loan');

        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showLoansList();
            });
        }

        if (makeRepaymentBtn) {
            makeRepaymentBtn.addEventListener('click', () => {
                this.showRepaymentModal();
            });
        }

        if (viewStatementBtn) {
            viewStatementBtn.addEventListener('click', () => {
                Utils.showAlert('Statement download feature coming soon!', 'info');
            });
        }

        if (contactSupportBtn) {
            contactSupportBtn.addEventListener('click', () => {
                Utils.showAlert('Contact support at loans@ubuntucap.com', 'info');
            });
        }

        if (extendLoanBtn) {
            extendLoanBtn.addEventListener('click', () => {
                Utils.showAlert('Loan extension feature coming soon!', 'info');
            });
        }
    }

    showRepaymentModal() {
        Utils.showAlert('Repayment processing feature coming soon!', 'info');
    }
}

// Add CSS for loans components
const loansStyle = document.createElement('style');
loansStyle.textContent = `
    .loan-item {
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .loan-item:hover {
        background: #f8f9fa;
        border-color: var(--primary-color);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .loan-item-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .loan-info {
        flex: 1;
    }

    .loan-amount {
        margin: 0 0 0.5rem 0;
        color: var(--primary-color);
        font-size: 1.2rem;
    }

    .loan-meta {
        margin: 0 0 0.25rem 0;
        color: var(--text-light);
        font-size: 0.9rem;
    }

    .loan-purpose {
        margin: 0;
        color: var(--text-color);
        font-size: 0.9rem;
    }

    .loan-days {
        margin: 0.25rem 0 0 0;
        color: var(--secondary-color);
        font-weight: 600;
        font-size: 0.9rem;
    }

    .loan-status {
        text-align: right;
    }

    .overdue-warning {
        margin: 0.5rem 0 0 0;
        color: var(--error-color);
        font-weight: bold;
        font-size: 0.8rem;
    }

    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-pending {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
    }
    
    .status-approved, .status-active {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .status-rejected {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .status-disbursed {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
    }
    
    .status-overdue {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .status-paid, .status-completed {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .status-defaulted {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--text-light);
    }

    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .empty-state h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-color);
    }

    .empty-state p {
        margin: 0 0 1.5rem 0;
    }

    .loading-state {
        text-align: center;
        padding: 2rem;
        color: var(--text-light);
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }

    .info-item {
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-color);
    }

    .info-item:last-child {
        border-bottom: none;
    }

    .calculator-result {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 6px;
        margin-top: 1rem;
    }

    .calc-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .calc-line.total {
        border-top: 1px solid #ddd;
        padding-top: 0.5rem;
        margin-top: 0.5rem;
        font-weight: bold;
    }

    .loan-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-color);
    }

    .detail-item:last-child {
        border-bottom: none;
    }

    .repayment-summary {
        text-align: center;
    }

    .remaining-balance {
        font-size: 2rem;
        font-weight: bold;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .balance-label {
        color: var(--text-light);
        margin-bottom: 1.5rem;
    }

    .repayment-breakdown {
        text-align: left;
    }

    .breakdown-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .breakdown-item.total {
        border-top: 1px solid #ddd;
        padding-top: 0.5rem;
        font-weight: bold;
    }

    .table-container {
        overflow-x: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
    }

    .data-table th,
    .data-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }

    .data-table th {
        background: #f8f9fa;
        font-weight: 600;
    }

    .action-btn {
        width: 100%;
        margin-bottom: 0.5rem;
        text-align: left;
    }

    .action-btn:last-child {
        margin-bottom: 0;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(loansStyle);

// Create global instance
window.loansManager = new LoansManager();