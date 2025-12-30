import React from "react";
import { useNotification } from "./NotificationContext";
import type { Notification } from "./NotificationContext";
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

const getStyles = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return {
        border: "border-green-500",
        badgeBg: "bg-green-500",
        title: "text-green-700",
      };
    case "error":
      return {
        border: "border-red-500",
        badgeBg: "bg-red-500",
        title: "text-red-700",
      };
    case "warning":
      return {
        border: "border-amber-500",
        badgeBg: "bg-amber-500",
        title: "text-amber-700",
      };
    case "info":
    default:
      return {
        border: "border-blue-500",
        badgeBg: "bg-blue-500",
        title: "text-blue-700",
      };
  }
};

const getIcon = (type: Notification["type"]) => {
  const className = "w-5 h-5 text-white";
  switch (type) {
    case "success":
      return <CheckCircleIcon className={className} />;
    case "error":
      return <ExclamationCircleIcon className={className} />;
    case "warning":
      return <ExclamationCircleIcon className={className} />;
    case "info":
    default:
      return <InformationCircleIcon className={className} />;
  }
};

export const NotificationContainer: React.FC = () => {
  const { notifications, remove } = useNotification();

  return (
    <div
      className="
        fixed top-6 right-6
        z-[99999]          // ← z-index MUY alto
        pointer-events-none
        flex flex-col gap-3
      "
    >
      {notifications.map((n) => {
        const styles = getStyles(n.type);
        return (
          <div
            key={n.id}
            className={`
              pointer-events-auto
              flex items-start gap-3 bg-white shadow-lg rounded-lg border-l-4
              ${styles.border} px-4 py-3 min-w-[260px]
            `}
          >
            <div className={`mt-0.5 rounded-full ${styles.badgeBg} p-1.5`}>
              {getIcon(n.type)}
            </div>
            <div className="flex-1">
              <div className={`font-semibold text-sm ${styles.title}`}>
                {n.title}
              </div>
              <div className="text-xs text-gray-600">{n.message}</div>
            </div>
            <button
              onClick={() => remove(n.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
