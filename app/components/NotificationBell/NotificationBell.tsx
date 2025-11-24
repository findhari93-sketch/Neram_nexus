// app/components/NotificationBell/NotificationBell.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Button,
  Chip,
  Stack,
  Avatar,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DescriptionIcon from "@mui/icons-material/Description";
import PaymentIcon from "@mui/icons-material/Payment";
import EditIcon from "@mui/icons-material/Edit";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import type { NotificationType } from "@/types/notification";

export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificationId: string, userId: string) => {
    markAsRead(notificationId);
    window.location.href = `/web-users/${userId}`;
    handleClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "normal":
        return "info";
      case "low":
      default:
        return "default";
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "application_submitted":
        return <DescriptionIcon fontSize="small" />;
      case "application_approved":
        return <CheckCircleIcon fontSize="small" color="success" />;
      case "application_rejected":
        return <CancelIcon fontSize="small" color="error" />;
      case "profile_updated":
        return <EditIcon fontSize="small" />;
      case "payment_pending":
        return <PendingIcon fontSize="small" color="warning" />;
      case "payment_completed":
        return <PaymentIcon fontSize="small" color="success" />;
      case "payment_failed":
        return <PaymentIcon fontSize="small" color="error" />;
      case "document_uploaded":
        return <DescriptionIcon fontSize="small" color="primary" />;
      case "user_registered":
        return <PersonAddIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const getNotificationIconBg = (type: NotificationType) => {
    switch (type) {
      case "application_approved":
      case "payment_completed":
        return "#e8f5e9";
      case "application_rejected":
      case "payment_failed":
        return "#ffebee";
      case "payment_pending":
        return "#fff3e0";
      case "application_submitted":
      case "document_uploaded":
        return "#e3f2fd";
      case "profile_updated":
        return "#f3e5f5";
      case "user_registered":
        return "#e0f2f1";
      default:
        return "#f5f5f5";
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { width: 420, maxHeight: 600 } }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {loading && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Loading notifications...
            </Typography>
          </Box>
        )}

        {!loading && notifications.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <NotificationsIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}

        {!loading && notifications.length > 0 && (
          <Box sx={{ maxHeight: 450, overflow: "auto" }}>
            {notifications.slice(0, 20).map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() =>
                  handleNotificationClick(notification.id, notification.user_id)
                }
                sx={{
                  px: 2,
                  py: 1.5,
                  backgroundColor: notification.is_read
                    ? "transparent"
                    : "action.hover",
                  "&:hover": {
                    backgroundColor: "action.selected",
                  },
                  alignItems: "flex-start",
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    mr: 1.5,
                    bgcolor: getNotificationIconBg(
                      notification.notification_type
                    ),
                  }}
                >
                  {getNotificationIcon(notification.notification_type)}
                </Avatar>
                <Stack spacing={0.5} sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={notification.is_read ? 400 : 600}
                    >
                      {notification.title}
                    </Typography>
                    <Chip
                      label={notification.priority}
                      size="small"
                      color={getPriorityColor(notification.priority) as any}
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {notification.message}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Box>
        )}

        {notifications.length > 20 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: "center" }}>
              <Button fullWidth size="small" href="/admin/notifications">
                View all notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
