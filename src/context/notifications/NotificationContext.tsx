import React, { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuid } from "uuid";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; 
}

interface NotificationContextValue {
  notifications: Notification[];
  notify: (n: Omit<Notification, "id">) => void;
  remove: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((n: Omit<Notification, "id">) => {
    const id = uuid();
    const notification: Notification = { id, duration: 4000, ...n };
    setNotifications((prev) => [...prev, notification]);

    // Auto-cerrar después de la duración especificada
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, notification.duration);
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, notify, remove }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
};