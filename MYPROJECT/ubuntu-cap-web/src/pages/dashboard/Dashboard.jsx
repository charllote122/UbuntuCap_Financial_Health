// src/pages/dashboard/Dashboard.jsx
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
                <p className="text-gray-600">
                    Welcome to UbuntuCap, {user?.first_name || 'User'}!
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800">Credit Score</h3>
                        <p className="text-2xl font-bold text-blue-600">720</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800">Active Loans</h3>
                        <p className="text-2xl font-bold text-green-600">2</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-800">Loan Offers</h3>
                        <p className="text-2xl font-bold text-purple-600">3</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;