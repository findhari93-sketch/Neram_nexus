import React, { useState } from "react";
import { useMsal, useAccount } from "@azure/msal-react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AdminPanelSettings,
  School,
  Person,
  Logout,
  ExpandMore,
} from "@mui/icons-material";

const Header = () => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    instance.logoutPopup().catch((e) => {
      console.error("Logout failed:", e);
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Extract user info from account
  const displayName =
    account?.idTokenClaims?.name || account?.name || "Unknown User";
  const email =
    account?.username || account?.idTokenClaims?.preferred_username || "";
  const roles = account?.idTokenClaims?.roles || [];
  const primaryRole = roles.length > 0 ? roles[0] : "User";

  // Get role color and icon
  const getRoleConfig = (role) => {
    switch (role) {
      case "Admin":
        return {
          color: "error",
          icon: <AdminPanelSettings />,
          label: "Administrator",
        };
      case "Teacher":
        return { color: "primary", icon: <School />, label: "Teacher" };
      case "Student":
        return { color: "success", icon: <Person />, label: "Student" };
      default:
        return { color: "default", icon: <Person />, label: "User" };
    }
  };

  const roleConfig = getRoleConfig(primaryRole);

  // Generate avatar from display name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!account) {
    return null;
  }

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <AdminPanelSettings sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Neram Admin Portal
        </Typography>

        {/* User Profile Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Role Chip */}
          <Chip
            icon={roleConfig.icon}
            label={roleConfig.label}
            color={roleConfig.color}
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />

          {/* User Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {getInitials(displayName)}
            </Avatar>

            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {displayName}
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.8, display: "block", lineHeight: 1 }}
              >
                {email}
              </Typography>
            </Box>

            {/* Profile Menu */}
            <Tooltip title="Profile Menu">
              <IconButton
                onClick={handleMenuOpen}
                sx={{ color: "white", ml: 1 }}
              >
                <ExpandMore />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem disabled>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {email}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem disabled>
            <Chip
              icon={roleConfig.icon}
              label={`Role: ${roleConfig.label}`}
              color={roleConfig.color}
              size="small"
            />
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
