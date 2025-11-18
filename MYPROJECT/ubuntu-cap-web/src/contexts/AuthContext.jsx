// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create and export the context
export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.getProfile();
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const userData = response.data.user || response.data;
            setUser(userData);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const newUser = response.data.user || response.data;
            setUser(newUser);
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message || 'Registration failed';
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await authAPI.updateProfile(profileData);
            setUser(prev => ({ ...prev, ...response.data }));
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message || 'Profile update failed';
            return { success: false, error: errorMessage };
        }
    };

    const value = {
        user,
        login,
        register,
        logout,
        updateProfile,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};