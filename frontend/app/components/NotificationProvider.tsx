"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import NotificationContainer, { NotificationData, NotificationType } from "./Notification";

type NotificationContextType = {
  addNotification: (message: string, type?: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Hook to access notification functions from any component.
 * Usage: const { addNotification } = useNotifications();
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

/**
 * Provider that manages notification state and listens for API-triggered notifications.
 * Polls the notification API route and displays notifications at the top-right of the screen.
 */
export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback(
    (message: string, type: NotificationType = "info", duration?: number) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const notification: NotificationData = {
        id,
        message,
        type,
        duration,
      };
      setNotifications((prev) => [...prev, notification]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Poll the notification API route for new notifications
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkForNotifications = async () => {
      try {
        const response = await fetch("/api/Notification");
        if (response.ok) {
          const data = await response.json();
          if (data.message) {
            addNotification(
              data.message,
              data.type || "info",
              data.duration
            );
          }
        }
      } catch (error) {
        // Silently fail - API might not be available yet
        console.debug("Notification API check failed:", error);
      }
    };

    // Check every 5 seconds for new notifications
    interval = setInterval(checkForNotifications, 5000);

    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onDismiss={removeNotification} />
    </NotificationContext.Provider>
  );
}
