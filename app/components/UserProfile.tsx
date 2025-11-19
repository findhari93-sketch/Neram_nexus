"use client";
import React from "react";
import {
  Stack,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";

function getInitials(name = "") {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

type Props = {
  name?: string;
  role?: string | null;
  size?: number;
};

const UserProfile: React.FC<Props> = ({ name = "User", role, size = 36 }) => {
  const initials = getInitials(name);
  const { data: session } = useSession();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = useCallback(() => {
    handleCloseMenu();
    signOut({ callbackUrl: "/auth/signin" });
  }, []);

  // Get photo URL from session if available
  useEffect(() => {
    if (session?.user?.image) {
      setPhotoUrl(session.user.image);
    }
  }, [session]);

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ cursor: "pointer" }}
        aria-haspopup="true"
        aria-controls={menuOpen ? "user-profile-menu" : undefined}
        aria-expanded={menuOpen ? "true" : undefined}
        onClick={handleOpenMenu}
      >
        <Stack
          direction="column"
          sx={{
            color: "#fff",
            lineHeight: 1,
            textAlign: "right",
            alignItems: "flex-end",
          }}
        >
          <Typography sx={{ fontWeight: 300, fontSize: 14, color: "#fff" }}>
            {name}
          </Typography>
          {role ? (
            <Typography
              sx={{ fontWeight: 300, fontSize: 12, color: "#ffee58" }}
            >
              {role}
            </Typography>
          ) : null}
        </Stack>
        <Avatar
          src={photoUrl || undefined}
          imgProps={{ referrerPolicy: "no-referrer" }}
          sx={{
            width: size,
            height: size,
            bgcolor: photoUrl ? "#ffffff" : "transparent",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "1px solid rgba(255,255,255,0.85)",
            transition: "box-shadow .2s, transform .15s",
            "&:hover": {
              boxShadow: "0 0 0 3px rgba(255,255,255,0.25)",
            },
            "&:active": {
              transform: "scale(.95)",
            },
          }}
        >
          {!photoUrl && initials}
        </Avatar>
      </Stack>
      <Menu
        id="user-profile-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        PaperProps={{
          elevation: 6,
          sx: {
            mt: 1.5,
            overflow: "visible",
            minWidth: 180,
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 18,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disabled sx={{ opacity: 1, cursor: "default" }}>
          <Stack direction="column" spacing={0.3}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {name}
            </Typography>
            {role && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {role}
              </Typography>
            )}
          </Stack>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            /* placeholder for navigation to settings */
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Account settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserProfile;
