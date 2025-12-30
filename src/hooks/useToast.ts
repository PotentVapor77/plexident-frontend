// src/hooks/useToast.ts
import { useState, useCallback } from 'react';
import type { ToastType } from '../components/ui/toast/Toast';

export interface ToastData {
    id: string;
    message: string;
    description?: string;
    type: ToastType;
    duration?: number;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((
        message: string,
        options?: {
            description?: string;
            type?: ToastType;
            duration?: number;
        }
    ) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: ToastData = {
            id,
            message,
            description: options?.description,
            type: options?.type || 'info',
            duration: options?.duration || 4000,
        };

        setToasts(prev => [...prev, newToast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        info: (message: string, description?: string) =>
            showToast(message, { description, type: 'info' }),
        success: (message: string, description?: string) =>
            showToast(message, { description, type: 'success' }),
        warning: (message: string, description?: string) =>
            showToast(message, { description, type: 'warning' }),
        error: (message: string, description?: string) =>
            showToast(message, { description, type: 'error' }),
    };

    return {
        toast,
        toasts,
        removeToast,
    };
};
