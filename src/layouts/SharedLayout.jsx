import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useMsal, useAccount } from "@azure/msal-react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Schedule,
  Assignment,
  People,
  School,
  Class,
  Book,
  Assessment,
  Settings,
  Logout,
} from "@mui/icons-material";
import SidebarItem from "../components/SidebarItem";

const drawerWidth = 240;
const collapsedWidth = 72;

// Role-based menu configuration
const menuItems = {
  teacher: [
    { icon: <Dashboard />, label: "Dashboard", to: "/teacher" },
    { icon: <Class />, label: "My Classes", to: "/teacher/classes" },
    { icon: <People />, label: "Students", to: "/teacher/students" },
    { icon: <Assignment />, label: "Assignments", to: "/teacher/assignments" },
    { icon: <Assessment />, label: "Grades", to: "/teacher/grades" },
    { icon: <Schedule />, label: "Schedule", to: "/teacher/schedule" },
    { icon: <Settings />, label: "Settings", to: "/teacher/settings" },
  ],
  student: [
    { icon: <Dashboard />, label: "Dashboard", to: "/student" },
    { icon: <Class />, label: "My Courses", to: "/student/courses" },
    { icon: <Assignment />, label: "Assignments", to: "/student/assignments" },
    { icon: <Assessment />, label: "Grades", to: "/student/grades" },
    { icon: <Schedule />, label: "Schedule", to: "/student/schedule" },
    { icon: <Book />, label: "Resources", to: "/student/resources" },
    { icon: <Settings />, label: "Settings", to: "/student/settings" },
  ],
};

const SharedLayout = ({ userRole = "student" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  // Sidebar state management
  const [open, setOpen] = useState(() => {
    if (isMobile) return false;
    return JSON.parse(localStorage.getItem(`${userRole}NavOpen`) ?? "true");
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Update localStorage when sidebar state changes
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem(`${userRole}NavOpen`, JSON.stringify(open));
    }
  }, [open, isMobile, userRole]);

  // Reset sidebar state on mobile/desktop switch
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
      setMobileOpen(false);
    } else {
      setOpen(JSON.parse(localStorage.getItem(`${userRole}NavOpen`) ?? "true"));
    }
  }, [isMobile, userRole]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    instance.logoutPopup().catch((e) => {
      console.error("Logout failed:", e);
    });
    handleProfileMenuClose();
  };

  // User info
  const displayName = account?.idTokenClaims?.name || account?.name || "User";
  const email =
    account?.username || account?.idTokenClaims?.preferred_username || "";
  const roles = account?.idTokenClaims?.roles || [];
  const primaryRole = roles.length > 0 ? roles[0] : userRole;

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get navigation items based on role
  const navigationItems = menuItems[userRole] || menuItems.student;

  // Get app title based on role
  const getAppTitle = () => {
    switch (userRole) {
      case "teacher":
        return "Neram Teacher Portal";
      case "student":
        return "Neram Student Portal";
      default:
        return "Neram Portal";
    }
  };

  // Get sidebar title based on role
  const getSidebarTitle = () => {
    switch (userRole) {
      case "teacher":
        return "Teacher Panel";
      case "student":
        return "Student Panel";
      default:
        return "Portal";
    }
  };

  // Get sidebar icon based on role
  const getSidebarIcon = () => {
    switch (userRole) {
      case "teacher":
        return <School color="primary" />;
      case "student":
        return <Book color="primary" />;
      default:
        return <Dashboard color="primary" />;
    }
  };

  // Sidebar content
  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Sidebar header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile || open ? "space-between" : "center",
          px: isMobile || open ? 2 : 0,
          py: 2,
          minHeight: 64,
        }}
      >
        {(isMobile || open) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getSidebarIcon()}
            <Typography variant="h6" noWrap component="div" color="primary">
              {getSidebarTitle()}
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle} size="small">
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}
      </Box>

      {/* Navigation items */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.to}
            icon={item.icon}
            label={item.label}
            to={item.to}
            isCollapsed={!isMobile && !open}
            onClick={isMobile ? handleMobileClose : undefined}
          />
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            md: isMobile
              ? "100%"
              : `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
          },
          ml: {
            md: isMobile ? 0 : `${open ? drawerWidth : collapsedWidth}px`,
          },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar>
          {/* Menu button for mobile */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* App title */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getAppTitle()}
          </Typography>

          {/* User profile section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={primaryRole}
              color="secondary"
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                display: { xs: "none", sm: "flex" },
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                borderRadius: 1,
                px: 1,
                py: 0.5,
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
              onClick={handleProfileMenuOpen}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontSize: "0.875rem",
                }}
              >
                {getInitials(displayName)}
              </Avatar>

              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "medium", lineHeight: 1.2 }}
                >
                  {displayName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.8, lineHeight: 1 }}
                >
                  {email}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Profile menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
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
                label={`Role: ${primaryRole}`}
                color="primary"
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

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: isMobile ? 0 : open ? drawerWidth : collapsedWidth },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleMobileClose}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* Desktop drawer */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: open ? drawerWidth : collapsedWidth,
                transition: theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                overflowX: "hidden",
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
            open={open}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "grey.50",
          minHeight: "100vh",
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default SharedLayout;
