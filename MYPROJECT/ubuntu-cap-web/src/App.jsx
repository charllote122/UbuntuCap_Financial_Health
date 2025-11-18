// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReactQueryProvider } from './providers/ReactQueryProvider';
import AppToaster from './components/common/Toaster';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main Pages
import Dashboard from './pages/dashboard/Dashboard';
import CreditScore from './pages/credit/CreditScore';
import CreditAnalytics from './pages/credit/CreditAnalytics';
import LoanOffers from './pages/credit/LoanOffers';
import OfferHistory from './pages/credit/OfferHistory';
import UserLoans from './pages/loans/UserLoans';
import LoanApplications from './pages/loans/LoanApplications';
import LoanApplicationForm from './pages/loans/LoanApplicationForm';
import LoanDetails from './pages/loans/LoanDetails';
import PaymentHistory from './pages/payments/PaymentHistory';
import MakePayment from './pages/payments/MakePayment';
import UserProfile from './pages/profile/UserProfile';
import Settings from './pages/profile/Settings';

// M-Pesa Pages
import MpesaProfile from './pages/mpesa/MpesaProfile';
import TransactionHistory from './pages/mpesa/TransactionHistory';
import PaymentAnalysis from './pages/mpesa/PaymentAnalysis';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MLTraining from './pages/admin/MLTraining';
import LoanManagement from './pages/admin/LoanManagement';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ReactQueryProvider>
      <Router>
        <AuthProvider>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* Protected Routes with Layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Credit Routes */}
                <Route path="credit-score" element={<CreditScore />} />
                <Route path="credit-analytics" element={<CreditAnalytics />} />
                <Route path="loan-offers" element={<LoanOffers />} />
                <Route path="offer-history" element={<OfferHistory />} />

                {/* Loan Routes */}
                <Route path="loans" element={<UserLoans />} />
                <Route path="loans/applications" element={<LoanApplications />} />
                <Route path="loans/apply" element={<LoanApplicationForm />} />
                <Route path="loans/:loanId" element={<LoanDetails />} />

                {/* Payment Routes */}
                <Route path="payments" element={<PaymentHistory />} />
                <Route path="payments/make-payment" element={<MakePayment />} />

                {/* M-Pesa Routes */}
                <Route path="mpesa/profile" element={<MpesaProfile />} />
                <Route path="mpesa/transactions" element={<TransactionHistory />} />
                <Route path="mpesa/analysis" element={<PaymentAnalysis />} />

                {/* Profile Routes */}
                <Route path="profile" element={<UserProfile />} />
                <Route path="settings" element={<Settings />} />

                {/* Admin Routes */}
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/ml-training" element={<MLTraining />} />
                <Route path="admin/loan-management" element={<LoanManagement />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
            <AppToaster />
          </div>
        </AuthProvider>
      </Router>
    </ReactQueryProvider>
  );
}

export default App;