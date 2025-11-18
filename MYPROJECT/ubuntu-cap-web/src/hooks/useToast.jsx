// src/hooks/useToast.js
import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useToast = () => {
    const showToast = useCallback((message, type = 'default') => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'loading':
                toast.loading(message);
                break;
            default:
                toast(message);
        }
    }, []);

    const dismissToast = useCallback((toastId) => {
        toast.dismiss(toastId);
    }, []);

    return {
        toast: showToast,
        dismiss: dismissToast,
        success: (message) => showToast(message, 'success'),
        error: (message) => showToast(message, 'error'),
        loading: (message) => showToast(message, 'loading'),
    };
};