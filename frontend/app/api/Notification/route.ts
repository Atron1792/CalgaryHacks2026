import { NextResponse } from "next/server";

// In-memory queue for notifications (resets on server restart)
let notificationQueue: Array<{
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number;
}> = [];

/**
 * GET handler - Returns and clears the oldest notification in the queue.
 * Used by NotificationProvider to poll for new notifications.
 */
export async function GET() {
  if (notificationQueue.length === 0) {
    return NextResponse.json({ message: null });
  }

  // Return and remove the oldest notification
  const notification = notificationQueue.shift();
  return NextResponse.json(notification);
}

/**
 * POST handler - Adds a new notification to the queue.
 * 
 * Body schema:
 * {
 *   message: string;
 *   type?: "info" | "success" | "warning" | "error";
 *   duration?: number; // milliseconds
 * }
 * 
 * Example usage:
 * ```
 * fetch('/api/Notification', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ 
 *     message: 'Data sync complete!', 
 *     type: 'success' 
 *   })
 * });
 * ```
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, type = "info", duration } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    notificationQueue.push({ message, type, duration });

    return NextResponse.json({ success: true, queued: notificationQueue.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

/**
 * DELETE handler - Clears all notifications in the queue.
 */
export async function DELETE() {
  notificationQueue = [];
  return NextResponse.json({ success: true, message: "Queue cleared" });
}
