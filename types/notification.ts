// types/notification.ts
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type NotificationType =
  | "application_submitted"
  | "application_approved"
  | "application_rejected"
  | "profile_updated"
  | "payment_pending"
  | "payment_completed"
  | "payment_failed"
  | "document_uploaded"
  | "user_registered";

export type Notification = {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  priority: NotificationPriority;
  created_at: string;
  read_at: string | null;
  read_by: string | null;
};
