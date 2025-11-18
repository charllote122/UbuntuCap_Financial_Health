// src/components/Layout/Navbar.jsx
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-6 py-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Welcome back, {user?.first_name || 'User'}!
                    </h1>
                </div>
                <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;