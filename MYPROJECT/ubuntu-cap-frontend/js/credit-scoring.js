// Credit Scoring Management
class CreditScoringManager {
    constructor() {
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        // Credit scoring manager ready
    }

    showCreditDashboard() {
        this.currentView = 'dashboard';
        this.renderCreditView();
    }

    showScoreHistory() {
        this.currentView = 'history';
        this.renderCreditView();
    }

    showLoanOffers() {
        this.currentView = 'offers';
        this.renderCreditView();
    }

    async renderCreditView() {
        const mainContent = document.getElementById('main-content');

        switch (this.currentView) {
            case 'dashboard':
                mainContent.innerHTML = this.getCreditDashboardHTML();
                await this.loadCreditDashboard();
                break;
            case 'history':
                mainContent.innerHTML = this.getScoreHistoryHTML();
                await this.loadScoreHistory();
                break;
            case 'offers':
                mainContent.innerHTML = this.getLoanOffersHTML();
                await this.loadLoanOffers();
                break;
        }
    }

    getCreditDashboardHTML() {
        return `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>Credit Scoring Dashboard</h1>
                            <p>Your financial health analysis and credit insights</p>
                        </div>
                        <div>
                            <button class="btn btn-secondary" id="back-to-main-dashboard">
                                Back to Dashboard
                            </button>
                            <button class="btn btn-primary" id="calculate-new-score">
                                Calculate New Score
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-8">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Current Credit Score</h3>
                                </div>
                                <div id="current-score-display">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading your credit score...</p>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Quick Actions</h3>
                                </div>
                                <div class="quick-actions">
                                    <div class="action-btn" data-action="history">
                                        <div class="action-icon">📊</div>
                                        <div>Score History</div>
                                    </div>
                                    <div class="action-btn" data-action="offers">
                                        <div class="action-icon">💰</div>
                                        <div>Loan Offers</div>
                                    </div>
                                    <div class="action-btn" data-action="analytics">
                                        <div class="action-icon">📈</div>
                                        <div>Analytics</div>
                                    </div>
                                    <div class="action-btn" data-action="tips">
                                        <div class="action-icon">💡</div>
                                        <div>Improvement Tips</div>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Score Analysis</h3>
                                </div>
                                <div id="score-analysis">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading analysis...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Active Loan Offers</h3>
                                </div>
                                <div id="active-offers-preview">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading offers...</p>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Score Factors</h3>
                                </div>
                                <div id="score-factors">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading factors...</p>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Quick Stats</h3>
                                </div>
                                <div id="quick-stats">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading stats...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getScoreHistoryHTML() {
        return `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>Credit Score History</h1>
                            <p>Track your credit score progress over time</p>
                        </div>
                        <div>
                            <button class="btn btn-secondary" id="back-to-credit-dashboard">
                                Back to Dashboard
                            </button>
                            <button class="btn btn-outline" id="export-history">
                                Export History
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Score Timeline</h3>
                                </div>
                                <div id="score-timeline">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading your score history...</p>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Recent Calculations</h3>
                                </div>
                                <div id="recent-calculations">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading calculations...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getLoanOffersHTML() {
        return `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>Loan Offers</h1>
                            <p>Personalized loan offers based on your credit score</p>
                        </div>
                        <div>
                            <button class="btn btn-secondary" id="back-to-credit-dashboard">
                                Back to Dashboard
                            </button>
                            <button class="btn btn-primary" id="refresh-offers">
                                Refresh Offers
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-8">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Current Offers</h3>
                                </div>
                                <div id="current-offers-list">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading your loan offers...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Offer Details</h3>
                                </div>
                                <div id="offer-details">
                                    <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                                        <p>Select an offer to view details</p>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Offer History</h3>
                                </div>
                                <div id="offer-history">
                                    <div class="loading">
                                        <div class="spinner"></div>
                                        <p>Loading history...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadCreditDashboard() {
        try {
            // Load current score
            await this.loadCurrentScore();

            // Load active offers preview
            await this.loadActiveOffersPreview();

            // Load analytics
            await this.loadCreditAnalytics();

            this.attachCreditDashboardEventListeners();
        } catch (error) {
            console.error('Error loading credit dashboard:', error);
            Utils.showAlert('Failed to load credit dashboard', 'error');
        }
    }

    async loadCurrentScore() {
        try {
            // First, try to get the latest score from analytics
            const analyticsResponse = await fetch(API_CONFIG.BASE_URL + '/credit/scores/analytics/', {
                headers: {
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            const analyticsData = await analyticsResponse.json();

            if (analyticsData.success) {
                this.renderCurrentScore(analyticsData.analytics);
            } else {
                // If no analytics, show calculate score prompt
                this.showCalculateScorePrompt();
            }
        } catch (error) {
            console.error('Error loading current score:', error);
            this.showCalculateScorePrompt();
        }
    }

    renderCurrentScore(analytics) {
        const score = analytics.current_score;
        const category = this.getScoreCategory(score);
        const color = this.getScoreColor(score);

        document.getElementById('current-score-display').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="position: relative; display: inline-block;">
                    <div class="score-circle" style="width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(${color} ${score * 3.6}deg, #e1e8ed 0deg); display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <div style="width: 160px; height: 160px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                            <div style="font-size: 2.5rem; font-weight: bold; color: ${color};">${score}</div>
                            <div style="font-size: 1rem; color: ${color}; font-weight: 600;">${category}</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem;">
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">${analytics.best_score}</div>
                            <div style="color: #7f8c8d; font-size: 0.875rem;">Best Score</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">${analytics.average_score}</div>
                            <div style="color: #7f8c8d; font-size: 0.875rem;">Average</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">${analytics.total_calculations}</div>
                            <div style="color: #7f8c8d; font-size: 0.875rem;">Calculations</div>
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <span>Trend:</span>
                            <span class="trend-indicator trend-${analytics.score_trend}">
                                ${analytics.score_trend === 'improving' ? '📈 Improving' :
                analytics.score_trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render score factors
        this.renderScoreFactors(score);
        // Render improvement tips
        this.renderImprovementTips(score);
    }

    showCalculateScorePrompt() {
        document.getElementById('current-score-display').innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📊</div>
                <h3>No Credit Score Found</h3>
                <p style="color: #7f8c8d; margin-bottom: 2rem;">
                    Calculate your credit score to unlock personalized loan offers and financial insights.
                </p>
                <button class="btn btn-primary" id="calculate-first-score">
                    Calculate My Credit Score
                </button>
            </div>
        `;
    }

    renderScoreFactors(score) {
        const factors = this.generateScoreFactors(score);

        document.getElementById('score-factors').innerHTML = `
            <div style="space-y-3">
                ${factors.map(factor => `
                    <div style="display: flex; justify-content: between; align-items: center; padding: 0.75rem; background: #f8f9fa; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 600;">${factor.name}</div>
                            <div style="color: #7f8c8d; font-size: 0.875rem;">${factor.description}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600; color: ${factor.color};">${factor.impact}</div>
                            <div style="color: #7f8c8d; font-size: 0.875rem;">${factor.status}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderImprovementTips(score) {
        const tips = this.getImprovementTips(score);

        document.getElementById('score-analysis').innerHTML = `
            <div style="space-y-3">
                <h4 style="margin-bottom: 1rem;">Improvement Tips</h4>
                ${tips.map(tip => `
                    <div style="display: flex; align-items: flex-start; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 1.25rem; margin-right: 1rem;">💡</div>
                        <div>${tip}</div>
                    </div>
                `).join('')}
                
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e1e8ed;">
                    <h5>Next Steps</h5>
                    <ul style="margin-left: 1rem; color: #7f8c8d;">
                        <li>Complete your profile for better accuracy</li>
                        <li>Connect your M-Pesa for transaction analysis</li>
                        <li>Maintain consistent financial activity</li>
                    </ul>
                </div>
            </div>
        `;
    }

    async loadActiveOffersPreview() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + '/credit/offers/current/', {
                headers: {
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            const data = await response.json();

            if (data.success && data.offers.length > 0) {
                this.renderActiveOffersPreview(data.offers);
            } else {
                document.getElementById('active-offers-preview').innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                        <p>No active offers available</p>
                        <button class="btn btn-outline" id="calculate-for-offers" style="margin-top: 1rem;">
                            Calculate Score for Offers
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading active offers:', error);
            document.getElementById('active-offers-preview').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                    <p>Unable to load offers</p>
                </div>
            `;
        }
    }

    renderActiveOffersPreview(offers) {
        const bestOffer = offers[0]; // Assuming offers are sorted by best first

        document.getElementById('active-offers-preview').innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 2rem; font-weight: bold; color: #27ae60; margin-bottom: 0.5rem;">
                    ${Utils.formatCurrency(bestOffer.amount_offered)}
                </div>
                <div style="color: #7f8c8d; margin-bottom: 1rem;">Best Offer</div>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: left; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: between; margin-bottom: 0.5rem;">
                        <span>Interest Rate:</span>
                        <span style="font-weight: 600;">${bestOffer.interest_rate}%</span>
                    </div>
                    <div style="display: flex; justify-content: between; margin-bottom: 0.5rem;">
                        <span>Term:</span>
                        <span style="font-weight: 600;">${bestOffer.term_months} months</span>
                    </div>
                    <div style="display: flex; justify-content: between;">
                        <span>Monthly:</span>
                        <span style="font-weight: 600;">${Utils.formatCurrency(bestOffer.monthly_payment)}</span>
                    </div>
                </div>
                
                <button class="btn btn-primary" id="view-all-offers" style="width: 100%;">
                    View All Offers (${offers.length})
                </button>
            </div>
        `;
    }

    async loadCreditAnalytics() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + '/credit/scores/analytics/', {
                headers: {
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            const data = await response.json();

            if (data.success) {
                this.renderQuickStats(data.analytics);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    renderQuickStats(analytics) {
        document.getElementById('quick-stats').innerHTML = `
            <div style="space-y-3">
                <div style="display: flex; justify-content: between;">
                    <span>Score Trend:</span>
                    <span class="trend-indicator trend-${analytics.score_trend}">
                        ${analytics.score_trend}
                    </span>
                </div>
                <div style="display: flex; justify-content: between;">
                    <span>First Calculation:</span>
                    <span>${new Date(analytics.first_calculation).toLocaleDateString()}</span>
                </div>
                <div style="display: flex; justify-content: between;">
                    <span>Latest Update:</span>
                    <span>${new Date(analytics.latest_calculation).toLocaleDateString()}</span>
                </div>
                <div style="display: flex; justify-content: between;">
                    <span>Total Calculations:</span>
                    <span>${analytics.total_calculations}</span>
                </div>
            </div>
        `;
    }

    attachCreditDashboardEventListeners() {
        const backButton = document.getElementById('back-to-main-dashboard');
        const calculateButton = document.getElementById('calculate-new-score');
        const calculateFirstButton = document.getElementById('calculate-first-score');
        const viewOffersButton = document.getElementById('view-all-offers');
        const calculateForOffersButton = document.getElementById('calculate-for-offers');
        const actionButtons = document.querySelectorAll('.action-btn');

        if (backButton) {
            backButton.addEventListener('click', () => {
                window.dashboardManager.loadDashboard();
            });
        }

        if (calculateButton) {
            calculateButton.addEventListener('click', () => {
                this.calculateNewScore();
            });
        }

        if (calculateFirstButton) {
            calculateFirstButton.addEventListener('click', () => {
                this.calculateNewScore();
            });
        }

        if (viewOffersButton) {
            viewOffersButton.addEventListener('click', () => {
                this.showLoanOffers();
            });
        }

        if (calculateForOffersButton) {
            calculateForOffersButton.addEventListener('click', () => {
                this.calculateNewScore();
            });
        }

        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    async calculateNewScore() {
        try {
            Utils.showAlert('Calculating your credit score...', 'info');

            const response = await fetch(API_CONFIG.BASE_URL + '/credit/calculate-score/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                },
                body: JSON.stringify({
                    force_refresh: true,
                    model_preference: 'ml'
                })
            });

            const data = await response.json();

            if (data.success) {
                Utils.showAlert(`Credit score calculated: ${data.credit_score} (${data.score_category})`, 'success');

                // Reload the dashboard to show new score
                setTimeout(() => {
                    this.loadCreditDashboard();
                }, 1000);
            } else {
                Utils.showAlert(data.message || 'Failed to calculate credit score', 'error');
            }
        } catch (error) {
            console.error('Error calculating credit score:', error);
            Utils.showAlert('Failed to calculate credit score. Please try again.', 'error');
        }
    }

    async loadScoreHistory() {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + '/credit/scores/history/', {
                headers: {
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            const data = await response.json();

            if (data.success) {
                this.renderScoreHistory(data.history);
                this.attachScoreHistoryEventListeners();
            } else {
                this.showNoHistoryState();
            }
        } catch (error) {
            console.error('Error loading score history:', error);
            this.showNoHistoryState();
        }
    }

    renderScoreHistory(history) {
        // Render timeline
        document.getElementById('score-timeline').innerHTML = `
            <div style="height: 300px;">
                <canvas id="score-history-chart"></canvas>
            </div>
        `;

        // Render recent calculations
        document.getElementById('recent-calculations').innerHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e1e8ed;">Date</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e1e8ed;">Score</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e1e8ed;">Category</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e1e8ed;">Model</th>
                            <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #e1e8ed;">Offers</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${history.map(score => `
                            <tr style="border-bottom: 1px solid #e1e8ed;">
                                <td style="padding: 0.75rem;">
                                    ${new Date(score.date).toLocaleDateString()}
                                </td>
                                <td style="padding: 0.75rem;">
                                    <span style="font-weight: 600; color: ${this.getScoreColor(score.score)};">
                                        ${score.score}
                                    </span>
                                </td>
                                <td style="padding: 0.75rem;">
                                    <span class="score-category category-${this.getScoreCategory(score.score).toLowerCase()}">
                                        ${this.getScoreCategory(score.score)}
                                    </span>
                                </td>
                                <td style="padding: 0.75rem;">
                                    ${score.model_version}
                                </td>
                                <td style="padding: 0.75rem;">
                                    ${score.loan_offers_count}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Render chart
        this.renderScoreHistoryChart(history);
    }

    renderScoreHistoryChart(history) {
        const canvas = document.getElementById('score-history-chart');
        const ctx = canvas.getContext('2d');

        // Sort history by date
        const sortedHistory = history.sort((a, b) => new Date(a.date) - new Date(b.date));

        const dates = sortedHistory.map(score => new Date(score.date).toLocaleDateString());
        const scores = sortedHistory.map(score => score.score);

        // Simple chart rendering (in production, use a charting library like Chart.js)
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;

        ctx.clearRect(0, 0, width, height);

        // Draw axes
        ctx.strokeStyle = '#e1e8ed';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw score line
        if (scores.length > 1) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.beginPath();

            const xStep = (width - 2 * padding) / (scores.length - 1);
            const yRange = 100; // 0-100 score range
            const yScale = (height - 2 * padding) / yRange;

            scores.forEach((score, index) => {
                const x = padding + index * xStep;
                const y = height - padding - (score * yScale);

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Draw points
            scores.forEach((score, index) => {
                const x = padding + index * xStep;
                const y = height - padding - (score * yScale);

                ctx.fillStyle = this.getScoreColor(score);
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    }

    async loadLoanOffers() {
        try {
            const [currentResponse, historyResponse] = await Promise.all([
                fetch(API_CONFIG.BASE_URL + '/credit/offers/current/', {
                    headers: {
                        'Authorization': `Bearer ${window.appState.token}`,
                        'X-CSRFToken': Utils.getCSRFToken()
                    }
                }),
                fetch(API_CONFIG.BASE_URL + '/credit/offers/history/', {
                    headers: {
                        'Authorization': `Bearer ${window.appState.token}`,
                        'X-CSRFToken': Utils.getCSRFToken()
                    }
                })
            ]);

            const currentData = await currentResponse.json();
            const historyData = await historyResponse.json();

            this.renderCurrentOffers(currentData.offers);
            this.renderOfferHistory(historyData.offers);
            this.attachLoanOffersEventListeners();
        } catch (error) {
            console.error('Error loading loan offers:', error);
            Utils.showAlert('Failed to load loan offers', 'error');
        }
    }

    renderCurrentOffers(offers) {
        const container = document.getElementById('current-offers-list');

        if (!offers || offers.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">💰</div>
                    <h3>No Current Offers</h3>
                    <p style="color: #7f8c8d; margin-bottom: 2rem;">
                        Calculate your credit score to see personalized loan offers.
                    </p>
                    <button class="btn btn-primary" id="calculate-score-for-offers">
                        Calculate Credit Score
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = offers.map(offer => `
            <div class="offer-card" data-offer-id="${offer.id}" style="border: 2px solid #e1e8ed; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer; transition: all 0.3s ease;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <h3 style="margin: 0 0 0.5rem 0; color: #27ae60;">${Utils.formatCurrency(offer.amount_offered)}</h3>
                        <p style="margin: 0; color: #7f8c8d;">
                            ${offer.term_months} months • ${offer.interest_rate}% APR
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">${Utils.formatCurrency(offer.monthly_payment)}</div>
                        <div style="color: #7f8c8d; font-size: 0.875rem;">per month</div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: between; align-items: center;">
                    <div style="color: #7f8c8d; font-size: 0.875rem;">
                        Expires: ${new Date(offer.expires_at).toLocaleDateString()}
                    </div>
                    <div>
                        <button class="btn btn-outline btn-sm decline-offer" data-offer-id="${offer.id}" style="margin-right: 0.5rem;">
                            Decline
                        </button>
                        <button class="btn btn-primary btn-sm accept-offer" data-offer-id="${offer.id}">
                            Accept Offer
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderOfferHistory(offers) {
        const container = document.getElementById('offer-history');

        if (!offers || offers.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: #7f8c8d;">
                    <p>No offer history</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="max-height: 300px; overflow-y: auto;">
                ${offers.slice(0, 5).map(offer => `
                    <div style="padding: 0.75rem; border-bottom: 1px solid #e1e8ed;">
                        <div style="display: flex; justify-content: between; align-items: center;">
                            <div>
                                <div style="font-weight: 600;">${Utils.formatCurrency(offer.amount_offered)}</div>
                                <div style="color: #7f8c8d; font-size: 0.875rem;">
                                    ${new Date(offer.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <span class="offer-status status-${offer.status.toLowerCase()}">
                                ${offer.status}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachLoanOffersEventListeners() {
        const backButton = document.getElementById('back-to-credit-dashboard');
        const refreshButton = document.getElementById('refresh-offers');
        const calculateButton = document.getElementById('calculate-score-for-offers');
        const offerCards = document.querySelectorAll('.offer-card');
        const acceptButtons = document.querySelectorAll('.accept-offer');
        const declineButtons = document.querySelectorAll('.decline-offer');

        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showCreditDashboard();
            });
        }

        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadLoanOffers();
            });
        }

        if (calculateButton) {
            calculateButton.addEventListener('click', () => {
                this.calculateNewScore();
            });
        }

        offerCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const offerId = card.dataset.offerId;
                    this.showOfferDetails(offerId);
                }
            });
        });

        acceptButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const offerId = button.dataset.offerId;
                this.acceptLoanOffer(offerId);
            });
        });

        declineButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const offerId = button.dataset.offerId;
                this.declineLoanOffer(offerId);
            });
        });
    }

    async acceptLoanOffer(offerId) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + '/credit/offers/accept/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                },
                body: JSON.stringify({ offer_id: offerId })
            });

            const data = await response.json();

            if (data.success) {
                Utils.showAlert('Loan offer accepted successfully!', 'success');
                // Reload offers
                this.loadLoanOffers();
            } else {
                Utils.showAlert(data.message || 'Failed to accept offer', 'error');
            }
        } catch (error) {
            console.error('Error accepting loan offer:', error);
            Utils.showAlert('Failed to accept loan offer', 'error');
        }
    }

    async declineLoanOffer(offerId) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + '/credit/offers/' + offerId + '/decline/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.appState.token}`,
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            const data = await response.json();

            if (data.success) {
                Utils.showAlert('Loan offer declined', 'info');
                // Reload offers
                this.loadLoanOffers();
            } else {
                Utils.showAlert(data.message || 'Failed to decline offer', 'error');
            }
        } catch (error) {
            console.error('Error declining loan offer:', error);
            Utils.showAlert('Failed to decline loan offer', 'error');
        }
    }

    // Helper methods
    getScoreCategory(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        if (score >= 50) return 'Basic';
        if (score >= 40) return 'Limited';
        return 'Poor';
    }

    getScoreColor(score) {
        if (score >= 80) return '#27ae60';
        if (score >= 70) return '#2ecc71';
        if (score >= 60) return '#f39c12';
        if (score >= 50) return '#e67e22';
        if (score >= 40) return '#e74c3c';
        return '#c0392b';
    }

    getImprovementTips(score) {
        const tips = [];

        if (score < 60) {
            tips.push("Increase your transaction frequency");
            tips.push("Maintain consistent income patterns");
        }

        if (score < 70) {
            tips.push("Diversify your transaction network");
            tips.push("Reduce evening and weekend transactions");
        }

        if (score < 80) {
            tips.push("Maintain positive savings ratio");
            tips.push("Keep expense-to-income ratio below 80%");
        }

        return tips.length > 0 ? tips : ["Your credit habits are excellent! Keep up the good work."];
    }

    generateScoreFactors(score) {
        return [
            {
                name: 'Transaction Frequency',
                description: 'How often you make transactions',
                impact: score >= 70 ? 'High' : 'Medium',
                status: score >= 70 ? 'Good' : 'Needs Improvement',
                color: score >= 70 ? '#27ae60' : '#f39c12'
            },
            {
                name: 'Income Consistency',
                description: 'Regularity of income patterns',
                impact: score >= 65 ? 'High' : 'Medium',
                status: score >= 65 ? 'Good' : 'Needs Work',
                color: score >= 65 ? '#27ae60' : '#f39c12'
            },
            {
                name: 'Savings Ratio',
                description: 'Income vs expenses balance',
                impact: score >= 75 ? 'High' : 'Low',
                status: score >= 75 ? 'Excellent' : 'Could Improve',
                color: score >= 75 ? '#27ae60' : '#e74c3c'
            }
        ];
    }

    handleQuickAction(action) {
        switch (action) {
            case 'history':
                this.showScoreHistory();
                break;
            case 'offers':
                this.showLoanOffers();
                break;
            case 'analytics':
                // Could show detailed analytics modal
                Utils.showAlert('Detailed analytics feature coming soon!', 'info');
                break;
            case 'tips':
                // Could show improvement tips modal
                Utils.showAlert('Personalized tips feature coming soon!', 'info');
                break;
        }
    }

    showNoHistoryState() {
        document.getElementById('score-timeline').innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📈</div>
                <h3>No Score History</h3>
                <p style="color: #7f8c8d;">
                    Calculate your first credit score to start tracking your progress.
                </p>
            </div>
        `;

        document.getElementById('recent-calculations').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                <p>No calculations yet</p>
            </div>
        `;
    }

    attachScoreHistoryEventListeners() {
        const backButton = document.getElementById('back-to-credit-dashboard');
        const exportButton = document.getElementById('export-history');

        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showCreditDashboard();
            });
        }

        if (exportButton) {
            exportButton.addEventListener('click', () => {
                Utils.showAlert('Export feature coming soon!', 'info');
            });
        }
    }

    showOfferDetails(offerId) {
        // Implement offer details view
        Utils.showAlert(`Showing details for offer ${offerId}`, 'info');
    }
}

// Add CSS for credit scoring
const creditScoringStyle = document.createElement('style');
creditScoringStyle.textContent = `
    .score-circle {
        position: relative;
    }
    
    .trend-indicator {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .trend-improving {
        background: #d4edda;
        color: #155724;
    }
    
    .trend-declining {
        background: #f8d7da;
        color: #721c24;
    }
    
    .trend-stable {
        background: #fff3cd;
        color: #856404;
    }
    
    .score-category {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .category-excellent {
        background: #d4edda;
        color: #155724;
    }
    
    .category-good {
        background: #d1ecf1;
        color: #0c5460;
    }
    
    .category-fair {
        background: #fff3cd;
        color: #856404;
    }
    
    .category-basic {
        background: #ffeaa7;
        color: #856404;
    }
    
    .category-limited {
        background: #f8d7da;
        color: #721c24;
    }
    
    .category-poor {
        background: #f5c6cb;
        color: #721c24;
    }
    
    .offer-status {
        padding: 0.25rem 0.5rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-pending {
        background: #fff3cd;
        color: #856404;
    }
    
    .status-accepted {
        background: #d4edda;
        color: #155724;
    }
    
    .status-expired {
        background: #e2e3e5;
        color: #383d41;
    }
    
    .status-declined {
        background: #f8d7da;
        color: #721c24;
    }
    
    .offer-card:hover {
        border-color: #3498db !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(creditScoringStyle);