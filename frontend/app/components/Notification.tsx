/**
 * USAGE FROM CLIENT COMPONENTS:
 * 
 * import { useNotifications } from "@/app/components/NotificationProvider";
 * 
 * export default function MyComponent() {
 *   const { addNotification } = useNotifications();
 *   
 *   const handleSuccess = () => {
 *     addNotification('Operation completed!', 'success');
 *   };
 *   
 *   return <button onClick={handleSuccess}>Do Something</button>;
 * }
 * 
 * USAGE FROM API ROUTES:
 * 
 * await fetch('http://localhost:3000/api/Notification', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ 
 *     message: 'Data sync complete!', 
 *     type: 'success',
 *     duration: 5000 // optional, defaults to 5000ms
 *   })
 * });
 * 
 * NOTIFICATION TYPES:
 * - info: Blue (default)
 * - success: Green
 * - warning: Orange
 * - error: Red
 * 
 * API ENDPOINTS:
 * - GET /api/Notification - Polls for queued notifications (used internally)
 * - POST /api/Notification - Queue a new notification
 * - DELETE /api/Notification - Clear all queued notifications
 * 
 * TESTING:
 * Test from browser console:
 * fetch('/api/Notification', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ message: 'Test!', type: 'info' })
 * });
 * 
 * COMPONENTS:
 * - Notification.tsx (this file) - Individual notification display
 * - NotificationProvider.tsx - Context provider managing state and polling
 * - /api/Notification/route.ts - API endpoint for queuing notifications
 */

"use client";

import { useEffect, useState } from "react";

/**
 * Available notification types with associated colors.
 */
export type NotificationType = "info" | "success" | "warning" | "error";

/**
 * Data structure for a single notification.
 */
export type NotificationData = {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number; // Auto-dismiss duration in milliseconds (default: 5000)
};

/**
 * Props for the NotificationItem component.
 */
type NotificationItemProps = {
  notification: NotificationData;
  onDismiss: (id: string) => void;
};

/**
 * Color scheme for different notification types.
 * Each type has a background color and left border color.
 */
const NOTIFICATION_COLORS = {
  info: {
    bg: "bg-[color:var(--info-bg)]",
    border: "border-[color:var(--info-border)]",
  },
  success: {
    bg: "bg-[color:var(--success-bg)]",
    border: "border-[color:var(--success-border)]",
  },
  warning: {
    bg: "bg-[color:var(--warning-bg)]",
    border: "border-[color:var(--warning-border)]",
  },
  error: {
    bg: "bg-[color:var(--danger-bg)]",
    border: "border-[color:var(--danger-border)]",
  },
};

/**
 * Individual notification item with fade-in animation and auto-dismiss.
 * Displays a colored toast with message and dismiss button.
 */
function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const colors = NOTIFICATION_COLORS[notification.type];

  useEffect(() => {
    // Fade in
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto-dismiss after duration
    const duration = notification.duration ?? 5000;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(notification.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  return (
    <div
      className={`${colors.bg} ${colors.border} border-l-4 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md transition-all duration-300 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[color:var(--text-on-accent)] text-sm font-medium flex-1">
          {notification.message}
        </p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(notification.id), 300);
          }}
          className="text-[color:var(--text-on-accent)] opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Props for the NotificationContainer component.
 */
type NotificationContainerProps = {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
};

/**
 * Main notification container component.
 * 
 * Displays all active notifications in a fixed position at the top-right corner.
 * Renders above all other content with z-index 9999.
 * 
 * Used by NotificationProvider to display the notification stack.
 * You typically don't use this component directly - use the useNotifications hook instead.
 */
export default function NotificationContainer({
  notifications,
  onDismiss,
}: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}
