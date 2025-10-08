import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Dashboard,
  TableChart,
} from "@mui/icons-material";
import SidebarItem from "../components/SidebarItem";
import TopNavHeader, {
  HEADER_HEIGHT_XS,
  HEADER_HEIGHT_SM,
} from "../components/Shared/AppHeader/TopNavHeader";

const drawerWidth = 240;
const collapsedWidth = 50;

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const headerHeight = { xs: HEADER_HEIGHT_XS, sm: HEADER_HEIGHT_SM };

  // Sidebar state management
  const [open, setOpen] = useState(() => {
    if (isMobile) return false;
    return JSON.parse(localStorage.getItem("adminNavOpen") ?? "true");
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // Update localStorage when sidebar state changes
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("adminNavOpen", JSON.stringify(open));
    }
  }, [open, isMobile]);

  // Reset sidebar state on mobile/desktop switch
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
      setMobileOpen(false);
    } else {
      setOpen(JSON.parse(localStorage.getItem("adminNavOpen") ?? "true"));
    }
  }, [isMobile]);

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

  // User info

  // Navigation items
  const navigationItems = [
    { icon: <Dashboard />, label: "Dashboard", to: "/admin" },
    { icon: <TableChart />, label: "Enquiry Database", to: "/admin/enquiries" },
  ];

  // Sidebar content
  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        pb: 5,
      }}
    >
      {/* Navigation items */}
      <List sx={{ flexGrow: 1 }}>
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
      {!isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          size="small"
          sx={{
            position: "absolute",
            bottom: 8,
            right: 4,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 1,
            opacity: 0.15,
            transition: "opacity 0.25s, background-color 0.25s",
            "&:hover": { opacity: 1, backgroundColor: "background.paper" },
          }}
        >
          {open ? (
            <ChevronLeft fontSize="small" />
          ) : (
            <ChevronRight fontSize="small" />
          )}
        </IconButton>
      )}
    </Box>
  );

  // Inner component to contain Sidebar and Main content so they behave cohesively
  const LayoutBody = () => (
    <>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: isMobile ? 0 : open ? drawerWidth : collapsedWidth },
          flexShrink: { md: 0 },
          mt: { xs: `${headerHeight.xs}px`, sm: `${headerHeight.sm}px` },
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
                top: { xs: `${headerHeight.xs}px`, sm: `${headerHeight.sm}px` },
                height: {
                  xs: `calc(100% - ${headerHeight.xs}px)`,
                  sm: `calc(100% - ${headerHeight.sm}px)`,
                },
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
                top: { xs: `${headerHeight.xs}px`, sm: `${headerHeight.sm}px` },
                height: {
                  xs: `calc(100% - ${headerHeight.xs}px)`,
                  sm: `calc(100% - ${headerHeight.sm}px)`,
                },
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
          p: 2,
          flexGrow: 1,
          bgcolor: "grey.50",
          minHeight: {
            xs: `calc(100vh - ${headerHeight.xs}px)`,
            sm: `calc(100vh - ${headerHeight.sm}px)`,
          },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ml: { xs: 0, md: `${open ? drawerWidth : collapsedWidth}px` },
          width: {
            xs: "100%",
            md: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
          },
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Outlet />
      </Box>
    </>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar */}

      <TopNavHeader title="Admin Panel" />

      {/* Sidebar + Main content */}
      <LayoutBody />
    </Box>
  );
};

export default AdminLayout;
