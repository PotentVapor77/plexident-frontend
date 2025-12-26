// src/components/ui/toast/Toast.tsx
import { useEffect, useState } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
    message: string;
    description?: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export const Toast = ({
    message,
    description,
    type = 'info',
    duration = 4000,
    onClose
}: ToastProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // Animación de entrada
        const entryTimer = setTimeout(() => setIsVisible(true), 10);

        // Barra de progreso
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / (duration / 50));
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, 50);

        // Auto-cerrar después de la duración
        const exitTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Esperar animación de salida
        }, duration);

        return () => {
            clearTimeout(entryTimer);
            clearTimeout(exitTimer);
            clearInterval(progressInterval);
        };
    }, [duration, onClose]);

    const styles = {
        info: {
            bg: 'bg-blue-light-50 border-blue-light-200',
            icon: 'text-blue-light-600',
            text: 'text-gray-900',
            subtext: 'text-gray-700',
            progress: 'bg-blue-light-500',
        },
        success: {
            bg: 'bg-success-50 border-success-200',
            icon: 'text-success-600',
            text: 'text-gray-900',
            subtext: 'text-gray-700',
            progress: 'bg-success-500',
        },
        warning: {
            bg: 'bg-warning-50 border-warning-200',
            icon: 'text-warning-600',
            text: 'text-gray-900',
            subtext: 'text-gray-700',
            progress: 'bg-warning-500',
        },
        error: {
            bg: 'bg-error-50 border-error-200',
            icon: 'text-error-600',
            text: 'text-gray-900',
            subtext: 'text-gray-700',
            progress: 'bg-error-500',
        },
    };

    const currentStyle = styles[type];

    const icons = {
        info: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        ),
        success: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        ),
        warning: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
        ),
        error: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        ),
    };

    return (
        <div
            className={`
        fixed top-4 right-4 z-99999 max-w-sm w-full
        transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
        >
            <div
                className={`
          ${currentStyle.bg} 
          border rounded-lg shadow-theme-lg overflow-hidden
          font-outfit
        `}
            >
                {/* Contenido principal */}
                <div className="flex items-start gap-3 p-4">
                    {/* Icono */}
                    <div className="flex-shrink-0 mt-0.5">
                        <svg
                            className={`w-5 h-5 ${currentStyle.icon}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {icons[type]}
                        </svg>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${currentStyle.text}`}>
                            {message}
                        </p>
                        {description && (
                            <p className={`text-theme-xs mt-1 ${currentStyle.subtext}`}>
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Botón cerrar */}
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className={`
              flex-shrink-0 ${currentStyle.icon} 
              hover:opacity-70 transition-opacity
              rounded-md p-1 hover:bg-black/5
            `}
                        aria-label="Cerrar notificación"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Barra de progreso */}
                <div className="h-1 bg-black/5">
                    <div
                        className={`h-full transition-all duration-50 ease-linear ${currentStyle.progress}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
