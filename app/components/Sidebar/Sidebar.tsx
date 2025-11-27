"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuOpenIcon from "@mui/icons-material/MenuOpen"; // (kept for future use if needed)
import { usePathname, useRouter } from "next/navigation";
import { menuItems } from "../../../lib/menuConfig"; // centralized menu config

export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[]; // limit visibility (app role names)
};

interface SidebarProps {
  role?: string; // current app role
  open?: boolean;
  onToggle?: () => void;
  permanent?: boolean; // treat as permanent drawer (desktop)
  topOffset?: number; // pixels from top to start the drawer (so it doesn't sit under AppBar)
}

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 68;

// Map hrefs to icons; keeps icon concerns local without polluting menu config
const iconMap: Record<string, React.ReactNode> = {
  "/": <HomeIcon />,
  "/superadmin": <DashboardIcon />,
  "/admin": <DashboardIcon />,
  "/web-users": <GroupIcon />,
  "/class-requests": <HowToRegIcon />,
  "/teacher": <SchoolIcon />,
  "/student": <PeopleIcon />,
};

function getSidebarItems(role?: string): SidebarItem[] {
  // Detect current domain (client-side)
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const ADMIN_DOMAIN =
    process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "admin.neramclasses.com";
  const isAdminDomain = hostname.includes(ADMIN_DOMAIN.split(":")[0]);

  // Super admin: show all dashboards on admin domain, only teacher/student on app domain
  if (role === "super_admin") {
    if (isAdminDomain) {
      // On admin domain: show all dashboards
      const allowed = new Set([
        "/",
        "/superadmin",
        "/admin",
        "/web-users",
        "/class-requests",
        "/teacher",
        "/student",
      ]);
      return menuItems
        .filter((m) => allowed.has(m.href))
        .map((m) => ({ label: m.label, href: m.href, icon: iconMap[m.href] }));
    } else {
      // On app domain: show only teacher/student dashboards
      const allowed = new Set(["/", "/teacher", "/student"]);
      return menuItems
        .filter((m) => allowed.has(m.href))
        .map((m) => ({ label: m.label, href: m.href, icon: iconMap[m.href] }));
    }
  }

  // Admin: show admin-specific items on admin domain, teacher/student on app domain
  if (role === "admin") {
    if (isAdminDomain) {
      const allowed = new Set([
        "/",
        "/admin",
        "/web-users",
        "/class-requests",
      ]);
      return menuItems
        .filter((m) => allowed.has(m.href))
        .map((m) => ({ label: m.label, href: m.href, icon: iconMap[m.href] }));
    } else {
      // On app domain: show only teacher/student dashboards
      const allowed = new Set(["/", "/teacher", "/student"]);
      return menuItems
        .filter((m) => allowed.has(m.href))
        .map((m) => ({ label: m.label, href: m.href, icon: iconMap[m.href] }));
    }
  }

  // Teachers / Students and other roles: limited core items
  const allowed = new Set(["/", "/teacher", "/student"]);
  return menuItems
    .filter((m) => allowed.has(m.href))
    .map((m) => ({ label: m.label, href: m.href, icon: iconMap[m.href] }));
}

const Sidebar: React.FC<SidebarProps> = ({
  role,
  open = true,
  onToggle,
  permanent = true,
  topOffset,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(open);

  useEffect(() => {
    setExpanded(open);
  }, [open]);

  const items = getSidebarItems(role);

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Toggle button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "space-between" : "center",
          py: 1,
          px: 1,
        }}
      >
        {expanded && (
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
            aria-label="Sidebar title"
          >
            Menu
          </Typography>
        )}
        <IconButton
          size="small"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => {
            setExpanded((p) => !p);
            onToggle && onToggle();
          }}
        >
          {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List
        component="nav"
        aria-label="Main navigation"
        dense
        sx={{ flex: 1, overflowY: "auto", py: 0 }}
      >
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <ListItemButton
              key={item.href}
              onClick={() => {
                // client-side navigation in same tab
                router.push(item.href);
              }}
              selected={active}
              sx={{
                px: expanded ? 2 : 1.25,
                py: 0.75,
                borderRadius: 1,
                mb: 0.25,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                },
              }}
              aria-current={active ? "page" : undefined}
            >
              <Tooltip
                title={!expanded ? item.label : ""}
                placement="right"
                arrow
              >
                <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
              </Tooltip>
              {expanded && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: expanded ? 1.5 : 1, textAlign: "center" }}>
        <Typography variant="caption" sx={{ fontSize: 11, opacity: 0.6 }}>
          © {new Date().getFullYear()} Neram
        </Typography>
      </Box>
    </Box>
  );

  return permanent ? (
    <Drawer
      variant="permanent"
      open
      PaperProps={{
        elevation: 1,
        sx: (theme) => ({
          width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          transition: theme.transitions.create("width"),
          overflowX: "hidden",
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          // position the permanent drawer below the top AppBar if topOffset provided
          position: "fixed",
          top: topOffset ?? 0,
          height: `calc(100vh - ${topOffset ?? 0}px)`,
        }),
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="temporary"
      open={expanded}
      onClose={() => {
        setExpanded(false);
        onToggle && onToggle();
      }}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: EXPANDED_WIDTH,
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
export { EXPANDED_WIDTH, COLLAPSED_WIDTH };
