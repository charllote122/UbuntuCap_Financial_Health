// Profile Management
class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('🟡 ProfileManager initialized');
    }

    async showProfileEditor() {
        try {
            console.log('🟡 Loading profile data...');
            console.log('🔐 CSRF Token:', Utils.getCSRFToken() ? 'Present' : 'Missing');
            console.log('🔐 Auth State:', window.appState.isAuthenticated);

            const profileUrl = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROFILE.GET;
            console.log('📡 Profile URL:', profileUrl);

            // Show loading state
            Utils.showLoading('Loading profile...');

            const response = await fetch(profileUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                }
            });

            console.log('📡 Profile response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📡 Profile API Raw Response:', data);

            // Handle different response formats
            if (data.user || data.id) {
                this.renderProfileEditor(data);
            } else if (data.success) {
                this.renderProfileEditor(data.user || data);
            } else {
                this.renderProfileEditor(data);
            }
        } catch (error) {
            console.error('❌ Profile loading error:', error);
            Utils.showAlert(`Failed to load profile: ${error.message}`, 'error');
            this.showFallbackProfileEditor();
        } finally {
            Utils.hideLoading();
        }
    }

    renderProfileEditor(profileData) {
        const mainContent = document.getElementById('main-content');

        console.log('🟡 Raw profile data received:', profileData);

        // Handle different response formats
        let user, profile;

        if (profileData.user) {
            user = profileData.user;
            profile = user.profile || {};
        } else if (profileData.profile) {
            user = profileData;
            profile = user.profile || {};
        } else {
            user = profileData;
            profile = {};
        }

        // Fallback to app state if critical data is missing
        if ((!user.first_name && !user.email) && window.appState.user) {
            console.log('🟡 Using app state data as fallback');
            user = { ...window.appState.user, ...user };
        }

        console.log('🟡 Processed user data:', user);
        console.log('🟡 Processed profile data:', profile);

        // Calculate profile completion
        const completionPercentage = this.calculateProfileCompletion(user, profile);

        mainContent.innerHTML = `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>Profile Settings</h1>
                            <p>Manage your personal information</p>
                        </div>
                        <div class="dashboard-actions">
                            <button class="btn btn-secondary" id="back-to-dashboard">
                                ← Back to Dashboard
                            </button>
                            <button class="btn btn-outline" id="refresh-profile">
                                🔄 Refresh
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-8">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Personal Information</h3>
                                </div>
                                <div class="card-body">
                                    <form id="profile-form">
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="form-group">
                                                    <label class="form-label">First Name</label>
                                                    <input type="text" class="form-control" 
                                                           name="first_name" value="${this.escapeHtml(user.first_name || '')}" 
                                                           required>
                                                    <div class="form-error" id="first-name-error"></div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="form-group">
                                                    <label class="form-label">Last Name</label>
                                                    <input type="text" class="form-control" 
                                                           name="last_name" value="${this.escapeHtml(user.last_name || '')}"
                                                           required>
                                                    <div class="form-error" id="last-name-error"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">Email Address</label>
                                            <input type="email" class="form-control" 
                                                   name="email" value="${this.escapeHtml(user.email || '')}"
                                                   required>
                                            <div class="form-error" id="email-error"></div>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">Phone Number</label>
                                            <input type="tel" class="form-control" 
                                                   value="${this.escapeHtml(user.phone_number || '')}" 
                                                   disabled style="background: #f8f9fa;">
                                            <small class="form-text text-muted">Phone number cannot be changed</small>
                                        </div>

                                        <div class="form-group">
                                            <label class="form-label">ID Number</label>
                                            <input type="text" class="form-control" 
                                                   name="id_number" value="${this.escapeHtml(user.id_number || '')}">
                                            <div class="form-error" id="id-number-error"></div>
                                        </div>

                                        ${user.date_of_birth || profile.date_of_birth ? `
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="form-group">
                                                    <label class="form-label">Date of Birth</label>
                                                    <input type="date" class="form-control" 
                                                           name="date_of_birth" value="${profile.date_of_birth || user.date_of_birth || ''}">
                                                    <div class="form-error" id="date-of-birth-error"></div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="form-group">
                                                    <label class="form-label">Gender</label>
                                                    <select class="form-control" name="gender">
                                                        <option value="">Select Gender</option>
                                                        <option value="MALE" ${(profile.gender === 'MALE' || user.gender === 'MALE') ? 'selected' : ''}>Male</option>
                                                        <option value="FEMALE" ${(profile.gender === 'FEMALE' || user.gender === 'FEMALE') ? 'selected' : ''}>Female</option>
                                                        <option value="OTHER" ${(profile.gender === 'OTHER' || user.gender === 'OTHER') ? 'selected' : ''}>Other</option>
                                                        <option value="PREFER_NOT_TO_SAY" ${(profile.gender === 'PREFER_NOT_TO_SAY' || user.gender === 'PREFER_NOT_TO_SAY') ? 'selected' : ''}>Prefer not to say</option>
                                                    </select>
                                                    <div class="form-error" id="gender-error"></div>
                                                </div>
                                            </div>
                                        </div>
                                        ` : ''}

                                        ${profile.county || profile.town ? `
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="form-group">
                                                    <label class="form-label">County</label>
                                                    <input type="text" class="form-control" 
                                                           name="county" value="${this.escapeHtml(profile.county || '')}">
                                                    <div class="form-error" id="county-error"></div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="form-group">
                                                    <label class="form-label">Town/City</label>
                                                    <input type="text" class="form-control" 
                                                           name="town" value="${this.escapeHtml(profile.town || '')}">
                                                    <div class="form-error" id="town-error"></div>
                                                </div>
                                            </div>
                                        </div>
                                        ` : ''}

                                        ${profile.employment_status || profile.monthly_income ? `
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="form-group">
                                                    <label class="form-label">Employment Status</label>
                                                    <select class="form-control" name="employment_status">
                                                        <option value="">Select Status</option>
                                                        <option value="EMPLOYED" ${profile.employment_status === 'EMPLOYED' ? 'selected' : ''}>Employed</option>
                                                        <option value="SELF_EMPLOYED" ${profile.employment_status === 'SELF_EMPLOYED' ? 'selected' : ''}>Self Employed</option>
                                                        <option value="UNEMPLOYED" ${profile.employment_status === 'UNEMPLOYED' ? 'selected' : ''}>Unemployed</option>
                                                        <option value="STUDENT" ${profile.employment_status === 'STUDENT' ? 'selected' : ''}>Student</option>
                                                        <option value="BUSINESS_OWNER" ${profile.employment_status === 'BUSINESS_OWNER' ? 'selected' : ''}>Business Owner</option>
                                                    </select>
                                                    <div class="form-error" id="employment-status-error"></div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="form-group">
                                                    <label class="form-label">Monthly Income (KES)</label>
                                                    <input type="number" class="form-control" 
                                                           name="monthly_income" value="${profile.monthly_income || ''}"
                                                           min="0" step="1000">
                                                    <div class="form-error" id="monthly-income-error"></div>
                                                </div>
                                            </div>
                                        </div>
                                        ` : ''}

                                        ${profile.occupation ? `
                                        <div class="form-group">
                                            <label class="form-label">Occupation</label>
                                            <input type="text" class="form-control" 
                                                   name="occupation" value="${this.escapeHtml(profile.occupation || '')}">
                                            <div class="form-error" id="occupation-error"></div>
                                        </div>
                                        ` : ''}

                                        <div class="form-actions">
                                            <button type="submit" class="btn btn-primary" id="update-profile-btn">
                                                Update Profile
                                            </button>
                                            <button type="button" class="btn btn-outline" id="cancel-profile-btn">
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
                                    <h3 class="card-title">Account Status</h3>
                                </div>
                                <div class="card-body">
                                    <div class="status-item">
                                        <label>Phone Verified:</label>
                                        <span class="status-badge ${user.is_verified ? 'verified' : 'not-verified'}">
                                            ${user.is_verified ? '✅ Verified' : '❌ Not Verified'}
                                        </span>
                                    </div>
                                    <div class="status-item">
                                        <label>Profile Complete:</label>
                                        <span>${completionPercentage}%</span>
                                    </div>
                                    
                                    ${!user.is_verified ? `
                                        <div style="margin-top: 1rem;">
                                            <button class="btn btn-warning" id="verify-account-btn" style="width: 100%;">
                                                Verify Phone Number
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">Profile Completion</h3>
                                </div>
                                <div class="card-body">
                                    <div style="text-align: center;">
                                        <div style="font-size: 2rem; font-weight: bold; color: #3498db; margin-bottom: 0.5rem;">
                                            ${completionPercentage}%
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${completionPercentage}%"></div>
                                        </div>
                                        <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
                                            Complete your profile to improve your credit opportunities
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachProfileEventListeners();
    }

    attachProfileEventListeners() {
        console.log('🟡 Attaching profile event listeners...');

        const profileForm = document.getElementById('profile-form');
        const backButton = document.getElementById('back-to-dashboard');
        const refreshButton = document.getElementById('refresh-profile');
        const verifyButton = document.getElementById('verify-account-btn');
        const cancelButton = document.getElementById('cancel-profile-btn');

        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
            console.log('✅ Profile form listener attached');
        }

        if (backButton) {
            backButton.addEventListener('click', () => {
                console.log('🟡 Back to dashboard clicked');
                if (window.dashboardManager) {
                    window.dashboardManager.loadDashboard();
                } else {
                    Utils.showAlert('Dashboard manager not available', 'error');
                }
            });
            console.log('✅ Back button listener attached');
        }

        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                console.log('🟡 Refresh profile clicked');
                this.showProfileEditor();
            });
            console.log('✅ Refresh button listener attached');
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                console.log('🟡 Cancel clicked');
                if (window.dashboardManager) {
                    window.dashboardManager.loadDashboard();
                }
            });
            console.log('✅ Cancel button listener attached');
        }

        if (verifyButton) {
            verifyButton.addEventListener('click', () => {
                console.log('🟡 Verify account clicked');
                this.handleAccountVerification();
            });
            console.log('✅ Verify button listener attached');
        }

        console.log('✅ All profile event listeners attached');
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        console.log('🟡 Profile update submitted');

        const updateButton = document.getElementById('update-profile-btn');

        try {
            Utils.setButtonLoading(updateButton, true, 'Updating...');

            // Clear previous errors
            this.clearFormErrors();

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            console.log('🟡 Updating profile with data:', data);

            const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROFILE.UPDATE, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Utils.getCSRFToken()
                },
                body: JSON.stringify(data)
            });

            console.log('📡 Profile update response status:', response.status);

            const result = await response.json();
            console.log('📡 Profile update response:', result);

            if (response.ok) {
                Utils.showAlert('Profile updated successfully!', 'success');

                // Update app state
                if (result.user) {
                    window.appState.setUser(result.user);
                } else if (result.id) {
                    window.appState.setUser(result);
                }

            } else {
                // Show form errors
                if (result.errors) {
                    this.displayFormErrors(result.errors);
                } else {
                    Utils.showAlert(result.message || result.detail || 'Failed to update profile', 'error');
                }
            }
        } catch (error) {
            console.error('❌ Profile update error:', error);
            Utils.showAlert(`Update failed: ${error.message}`, 'error');
        } finally {
            Utils.setButtonLoading(updateButton, false);
        }
    }

    clearFormErrors() {
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        console.log('✅ Form errors cleared');
    }

    displayFormErrors(errors) {
        Object.keys(errors).forEach(field => {
            const fieldName = field.replace(/_/g, '-');
            const errorElement = document.getElementById(`${fieldName}-error`);
            if (errorElement) {
                const errorMessage = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';

                // Highlight the problematic field
                const inputElement = document.querySelector(`[name="${field}"]`);
                if (inputElement) {
                    inputElement.classList.add('error');
                    inputElement.focus();
                }
            }
        });
        console.log('❌ Form errors displayed:', errors);
    }

    showFallbackProfileEditor() {
        console.log('🟡 Using fallback profile editor');

        const mainContent = document.getElementById('main-content');
        const user = window.appState.user || {};

        mainContent.innerHTML = `
            <div class="dashboard">
                <div class="container">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h1>Profile Settings</h1>
                            <p>Manage your personal information</p>
                            <div class="warning-banner">
                                ⚠️ Using cached profile data. Some features may be limited. 
                                <a href="#" id="retry-load-profile" style="color: #856404; text-decoration: underline;">Retry loading profile</a>
                            </div>
                        </div>
                        <button class="btn btn-secondary" id="back-to-dashboard-fallback">
                            ← Back to Dashboard
                        </button>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>Basic Information (Limited View)</h3>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6">
                                    <p><strong>Name:</strong> ${user.first_name || 'N/A'} ${user.last_name || ''}</p>
                                    <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                                </div>
                                <div class="col-6">
                                    <p><strong>Phone:</strong> ${user.phone_number || 'N/A'}</p>
                                    <p><strong>Status:</strong> ${user.is_verified ? 'Verified' : 'Not Verified'}</p>
                                </div>
                            </div>
                            <div style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                                <p style="margin: 0; color: #6c757d;">
                                    Full profile editing is temporarily unavailable. Please try again later.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Attach event listeners for fallback view
        document.getElementById('back-to-dashboard-fallback').addEventListener('click', () => {
            if (window.dashboardManager) {
                window.dashboardManager.loadDashboard();
            }
        });

        document.getElementById('retry-load-profile').addEventListener('click', (e) => {
            e.preventDefault();
            this.showProfileEditor();
        });
    }

    handleAccountVerification() {
        console.log('🟡 Handling account verification');
        if (window.authManager && window.appState.user?.phone_number) {
            window.authManager.showVerificationStep(window.appState.user.phone_number);
        } else {
            Utils.showAlert('Phone number not available. Please complete your profile first.', 'warning');
        }
    }

    calculateProfileCompletion(user, profile) {
        let completedFields = 0;
        const totalFields = 8;

        if (user.first_name) completedFields++;
        if (user.last_name) completedFields++;
        if (user.email) completedFields++;
        if (user.phone_number) completedFields++;
        if (user.id_number) completedFields++;
        if (profile.date_of_birth || user.date_of_birth) completedFields++;
        if (profile.employment_status) completedFields++;
        if (profile.occupation) completedFields++;

        return Math.round((completedFields / totalFields) * 100);
    }

    escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return unsafe.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Create global instance
window.profileManager = new ProfileManager();