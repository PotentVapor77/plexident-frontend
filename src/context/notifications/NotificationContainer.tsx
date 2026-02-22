import React from "react";
import { useNotification } from "./NotificationContext";
import type { Notification } from "./NotificationContext";
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon 
} from "@heroicons/react/24/solid";

export const NotificationContainer: React.FC = () => {
  const { notifications, remove } = useNotification();

  const getStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return {
          border: "border-emerald-500", // Usando emerald del sistema
          badgeBg: "bg-emerald-100",
          badgeIcon: "text-emerald-600",
          title: "text-emerald-800",
          icon: <CheckCircleIcon className="w-5 h-5" />
        };
      case "error":
        return {
          border: "border-rose-500", // Usando rose para errores (alto riesgo)
          badgeBg: "bg-rose-100",
          badgeIcon: "text-rose-600",
          title: "text-rose-800",
          icon: <XCircleIcon className="w-5 h-5" />
        };
      case "warning":
        return {
          border: "border-amber-500", // Usando amber del sistema
          badgeBg: "bg-amber-100",
          badgeIcon: "text-amber-600",
          title: "text-amber-800",
          icon: <ExclamationTriangleIcon className="w-5 h-5" />
        };
      case "info":
      default:
        return {
          border: "border-blue-500", // Usando blue del sistema
          badgeBg: "bg-blue-50",
          badgeIcon: "text-blue-600",
          title: "text-blue-800",
          icon: <InformationCircleIcon className="w-5 h-5" />
        };
    }
  };

  return (
    <div
      className="
        fixed top-6 right-6
        z-[99999]
        pointer-events-none
        flex flex-col gap-3
        max-w-md
        w-full
      "
    >
      {notifications.map((n) => {
        const styles = getStyles(n.type);
        
        return (
          <div
            key={n.id}
            className={`
              pointer-events-auto
              relative
              bg-white
              rounded-lg
              border-l-4
              border-r border-r-gray-200
              border-b border-b-gray-200
              border-t border-t-gray-200
              shadow-theme-sm
              ${styles.border}
              overflow-hidden
              animate-slide-in-right
            `}
          >
            {/* Barra de progreso para auto-cierre */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-gray-200 w-full"
            >
              <div 
                className={`h-full ${styles.badgeBg} transition-all duration-[4000ms] ease-linear`}
                style={{ 
                  width: n.duration ? '100%' : '0%',
                  animation: n.duration ? 'shrink 4s linear forwards' : 'none'
                }}
              />
            </div>

            <div className="flex items-start gap-3 p-4">
              {/* Icono con fondo de color */}
              <div className={`
                flex-shrink-0
                w-8 h-8
                rounded-full
                ${styles.badgeBg}
                flex items-center justify-center
              `}>
                <div className={styles.badgeIcon}>
                  {styles.icon}
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${styles.title}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 break-words">
                  {n.message}
                </p>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => remove(n.id)}
                className="
                  flex-shrink-0
                  w-6 h-6
                  rounded-full
                  flex items-center justify-center
                  text-gray-400
                  hover:text-gray-600
                  hover:bg-gray-100
                  transition-colors
                  focus:outline-none
                  focus:ring-2
                  focus:ring-gray-300
                "
                aria-label="Cerrar notificación"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Metadato de tiempo (similar al footer de las secciones) */}
            <div className="px-4 pb-2 flex justify-end">
              <span className="text-[10px] text-gray-400">
                hace un momento
              </span>
            </div>
          </div>
        );
      })}

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};