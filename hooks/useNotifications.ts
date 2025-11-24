// hooks/useNotifications.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabaseAdmin, type Notification } from "@/lib/supabaseAdmin";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recalcUnread = (list: Notification[]) =>
    list.filter((n) => !n.is_read).length;

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabaseAdmin
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const safeData = (data || []) as Notification[];
      setNotifications(safeData);
      setUnreadCount(recalcUnread(safeData));
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const now = new Date().toISOString();

      const { error: updateError } = await supabaseAdmin
        .from("notifications")
        .update({
          is_read: true,
          read_at: now,
        })
        .eq("id", notificationId);

      if (updateError) throw updateError;

      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: now } : n
        );
        setUnreadCount(recalcUnread(updated));
        return updated;
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);
      if (unreadIds.length === 0) return;

      const now = new Date().toISOString();

      const { error: updateError } = await supabaseAdmin
        .from("notifications")
        .update({
          is_read: true,
          read_at: now,
        })
        .in("id", unreadIds);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: now }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();

    let channel: RealtimeChannel | undefined;

    try {
      channel = supabaseAdmin
        .channel("notifications-channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
          },
          (payload) => {
            console.log("New notification received:", payload);
            const newNotification = payload.new as Notification;

            setNotifications((prev) => {
              const updated = [newNotification, ...prev];
              setUnreadCount(recalcUnread(updated));
              return updated;
            });

            // Browser notification with default icon
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification(newNotification.title, {
                body: newNotification.message,
              });
            }

            // Play notification sound (optional - you can add a sound file later)
            try {
              const audio = new Audio("/notification-sound.mp3");
              audio.play().catch(() => {
                // Silently fail if sound file doesn't exist
              });
            } catch (err) {
              // Sound is optional, don't log error
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
          },
          (payload) => {
            console.log("Notification updated:", payload);
            const updatedNotification = payload.new as Notification;

            setNotifications((prev) => {
              const updated = prev.map((n) =>
                n.id === updatedNotification.id ? updatedNotification : n
              );
              setUnreadCount(recalcUnread(updated));
              return updated;
            });
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status:", status);
        });
    } catch (err) {
      console.error("Error setting up realtime subscription:", err);
      setError("Failed to setup real-time notifications");
    }

    return () => {
      if (channel) {
        supabaseAdmin.removeChannel(channel);
      }
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
