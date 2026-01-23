// src/components/odontogram/3d/SaveSuccessOverlay.tsx

import React, { useEffect } from 'react';

interface SaveSuccessOverlayProps {
    isVisible: boolean;
    onComplete: () => void;
}

export const SaveSuccessOverlay: React.FC<SaveSuccessOverlayProps> = ({
    isVisible,
    onComplete,
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onComplete();
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80">
            <div className="animate-scale-up text-center">
                {/* Checkmark animado */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-100">
                    <svg
                        className="h-12 w-12 text-success-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {/* Mensaje */}
                <h2 className="mb-3 text-2xl font-semibold text-white">
                    ¡Odontograma Guardado!
                </h2>
                <p className="text-lg text-gray-300">
                    Los cambios se han guardado exitosamente.
                </p>
                <p className="mt-2 text-sm text-gray-400">
                    Recargando en 2 segundos...
                </p>

                {/* Spinner de carga */}
                <div className="mt-6 flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                </div>
            </div>
        </div>
    );
};