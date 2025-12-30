// src/components/odontogram/diagnostic/panel/NotificationManager.tsx
// src/components/odontograma/DiagnosticoPanel/components/NotificationManager.tsx

import React, { useEffect, useRef } from 'react';

import type { Notification } from '../../../../core/types/diagnostic.types';

// ============================================================================
// INTERFACES
// ============================================================================

interface NotificationManagerProps {
  /**
   * Lista de notificaciones activas
   */
  notifications: Notification[];

  /**
   * Callback para cerrar una notificación
   */
  onRemove: (id: string) => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL: NotificationManager
// ============================================================================

/**
 * Gestor de notificaciones tipo toast
 * 
 * Características:
 * - Auto-dismiss configurable
 * - Animaciones de entrada/salida
 * - Stack vertical (top-right)
 * - Cerrar manual con botón X
 * - Barra de progreso visual
 * - Tipos: success, error, warning, info
 */
export const NotificationManager: React.FC<NotificationManagerProps> = ({
  notifications,
  onRemove,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

// ============================================================================
// COMPONENTE: NotificationToast
// ============================================================================

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================================
  // AUTO-DISMISS
  // ============================================================================

  useEffect(() => {
    const duration = notification.duration ?? 5000;

    // Si no hay duración o no es dismissible, no auto-cerrar
    if (!duration || !notification.dismissible) {
      return;
    }

    // Iniciar progreso visual
    if (progressRef.current) {
      progressRef.current.style.transition = `width ${duration}ms linear`;
      progressRef.current.style.width = '0%';
    }

    // Auto-cerrar después de la duración
    timerRef.current = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [notification.duration, notification.dismissible, onClose]);

  // ============================================================================
  // ESTILOS POR TIPO
  // ============================================================================

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          container: 'bg-success-50 border-success-200',
          icon: 'bg-success-100 text-success-600',
          title: 'text-success-800',
          message: 'text-success-700',
          progress: 'bg-success-500',
          iconPath: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
        };
      case 'error':
        return {
          container: 'bg-error-50 border-error-200',
          icon: 'bg-error-100 text-error-600',
          title: 'text-error-800',
          message: 'text-error-700',
          progress: 'bg-error-500',
          iconPath: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
        };
      case 'warning':
        return {
          container: 'bg-warning-50 border-warning-200',
          icon: 'bg-warning-100 text-warning-600',
          title: 'text-warning-800',
          message: 'text-warning-700',
          progress: 'bg-warning-500',
          iconPath: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          ),
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-light-50 border-blue-light-200',
          icon: 'bg-blue-light-100 text-blue-light-600',
          title: 'text-blue-light-800',
          message: 'text-blue-light-700',
          progress: 'bg-blue-light-500',
          iconPath: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
        };
    }
  };

  const styles = getTypeStyles();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={`
        pointer-events-auto
        animate-slide-in-right
        overflow-hidden
        rounded-lg
        border
        shadow-theme-lg
        ${styles.container}
      `}
      role="alert"
    >
      {/* Contenido principal */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icono */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styles.icon}`}>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {styles.iconPath}
            </svg>
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h4 className={`text-sm font-semibold mb-1 ${styles.title}`}>
                {notification.title}
              </h4>
            )}
            {notification.message && (
              <p className={`text-xs leading-relaxed ${styles.message}`}>
                {notification.message}
              </p>
            )}
          </div>

          {/* Botón cerrar */}
          {notification.dismissible && (
            <button
              onClick={onClose}
              className="flex-shrink-0 w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center transition-colors"
              aria-label="Cerrar notificación"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Barra de progreso (auto-dismiss) */}
      {notification.duration && notification.dismissible && (
        <div className="h-1 bg-black/10">
          <div
            ref={progressRef}
            className={`h-full ${styles.progress}`}
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
};
