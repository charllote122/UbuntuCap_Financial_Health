// src/components/Layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navigation = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Credit Score', href: '/credit-score' },
        { name: 'Credit Analytics', href: '/credit-analytics' },
        { name: 'Loan Offers', href: '/loan-offers' },
        { name: 'Offer History', href: '/offer-history' },
        { name: 'My Loans', href: '/loans' },
        { name: 'Loan Applications', href: '/loans/applications' },
        { name: 'Apply for Loan', href: '/loans/apply' },
        { name: 'Payments', href: '/payments' },
        { name: 'Make Payment', href: '/payments/make-payment' },
        { name: 'M-Pesa Profile', href: '/mpesa/profile' },
        { name: 'Transactions', href: '/mpesa/transactions' },
        { name: 'Payment Analysis', href: '/mpesa/analysis' },
        { name: 'Profile', href: '/profile' },
        { name: 'Settings', href: '/settings' },
        { name: 'Admin', href: '/admin' },
        { name: 'ML Training', href: '/admin/ml-training' },
        { name: 'Loan Management', href: '/admin/loan-management' },
    ];

    return (
        <div className="w-64 bg-white shadow-lg border-r h-full overflow-y-auto">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-blue-600">UbuntuCap</h1>
                <p className="text-sm text-gray-600 mt-1">Financial Health</p>
            </div>
            <nav className="p-4 space-y-1">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            `block px-4 py-3 text-gray-700 rounded-lg transition-colors hover:bg-blue-50 hover:text-blue-600 text-sm ${isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;