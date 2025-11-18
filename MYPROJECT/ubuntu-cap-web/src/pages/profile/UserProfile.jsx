// src/pages/profile/UserProfile.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">User Profile</h1>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-gray-900">
                            {user?.first_name} {user?.last_name}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-gray-900">{user?.phone_number || 'Not provided'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;