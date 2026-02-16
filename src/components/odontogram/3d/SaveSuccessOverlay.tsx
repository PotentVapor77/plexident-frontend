// src/components/odontogram/3d/SaveSuccessOverlay.tsx

import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

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
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-end pointer-events-none">
            {/* Overlay semitransparente que cubre toda la pantalla */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <div className="relative w-full h-full">
                {/* Contenedor que excluye el panel derecho (360px) */}
                <div className="absolute inset-0 right-[360px] flex items-center justify-center pointer-events-none">
                    <div 
                        className="bg-white rounded-xl shadow-theme-xl border border-gray-200 p-8 max-w-md w-full mx-4 pointer-events-auto animate-scale-up"
                        style={{ 
                            animation: 'scaleUp 0.2s ease-out',
                            zIndex: 10000 
                        }}
                    >
                        <div className="text-center">
                            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                                <CheckCircle className="h-12 w-12 text-emerald-600" strokeWidth={1.5} />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                ¡Odontograma Guardado!
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Los cambios se han guardado exitosamente en el sistema.
                            </p>

                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ 
                                        animation: 'shrink 2s linear forwards',
                                        width: '100%'
                                    }}
                                />
                            </div>

                            <p className="text-xs text-gray-400">
                                Redirigiendo en 2 segundos...
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <span className="text-xs text-gray-400">
                                    {new Date().toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                @keyframes scaleUp {
                    from { 
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};