import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { useMsal } from "@azure/msal-react";
import UserProfile from "../UserProfile/UserProfile";
import Logo from "../../../assets/ClockLogo.svg"; // SVG asset

// Export header heights for layout calculations
export const HEADER_HEIGHT_XS = 52; // mobile
export const HEADER_HEIGHT_SM = 48; // >= sm

/**
 * TopNavHeader Component
 * Fixed header for the application with title, brand, and user profile
 *
 * Props:
 *  - title: string - Section/page title
 *  - onMenuClick: function - Optional callback for menu button click (mobile)
 */
const TopNavHeader = ({ title = "Admin Portal", onMenuClick }) => {
  const theme = useTheme();
  const { accounts } = useMsal();
  const account = accounts?.[0];

  const name = account?.name || "User";
  const roles = account?.idTokenClaims?.roles || [];
  const displayRole = roles[0];

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        backgroundImage: theme.palette.custom?.headerGradient,
        backgroundColor: "transparent",
        color: "#fff",
        borderBottom: "1px solid rgba(255,255,255,0.25)",
        zIndex: theme.zIndex.drawer,
      }}
    >
      <Toolbar
        sx={{
          minHeight: {
            xs: `${HEADER_HEIGHT_XS}px`,
            sm: `${HEADER_HEIGHT_SM}px`,
          },
          px: 2,
          gap: 1.25,
        }}
      >
        {/* Mobile menu toggle */}
        {onMenuClick && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ display: { md: "none" } }}
            size="large"
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Brand Logo */}
        <Box
          component="img"
          src={Logo}
          alt="Neram Nexus Logo"
          sx={{ height: 30, width: "auto", display: "block" }}
        />

        {/* Brand Name */}
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "Inter, Open Sans, sans-serif",
            letterSpacing: 0.3,
            whiteSpace: "nowrap",
          }}
        >
          Neram Nexus
        </Typography>

        {/* Secondary divider */}
        <Box
          sx={{
            width: 2,
            height: 22,
            bgcolor: "white",
            opacity: 0.25,
            borderRadius: 1,
          }}
        />

        {/* Dynamic page/section title */}
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "Inter, Open Sans, sans-serif",
            opacity: 0.9,
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>

        {/* Flexible spacer pushes profile to right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* User Profile */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <UserProfile name={name} role={displayRole} size={34} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavHeader;
