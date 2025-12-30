// src/components/ui/ToastContainer.tsx
import { Toast, type ToastType } from './Toast';

interface ToastData {
    id: string;
    message: string;
    description?: string;
    type: ToastType;
    duration?: number;
}

interface ToastContainerProps {
    toasts: ToastData[];
    onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-99999 space-y-3 pointer-events-none">
            {toasts.map((toastData, index) => (
                <div
                    key={toastData.id}
                    className="pointer-events-auto"
                    style={{
                        marginTop: index > 0 ? '12px' : '0',
                    }}
                >
                    <Toast
                        message={toastData.message}
                        description={toastData.description}
                        type={toastData.type}
                        duration={toastData.duration}
                        onClose={() => onRemove(toastData.id)}
                    />
                </div>
            ))}
        </div>
    );
};
