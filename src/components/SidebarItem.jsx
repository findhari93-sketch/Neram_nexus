import React from "react";
import { NavLink } from "react-router-dom";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";

const SidebarItem = ({ icon, label, to, isCollapsed, onClick }) => {
  const content = (
    <ListItem disablePadding>
      <ListItemButton
        component={NavLink}
        to={to}
        end={to === "/admin"}
        onClick={onClick}
        sx={{
          justifyContent: isCollapsed ? "center" : "initial",
          transition: "all 0.2s ease-in-out",
          "&.active": {
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            "& .MuiListItemIcon-root": {
              color: "primary.contrastText",
            },
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          },
          "&:hover": {
            backgroundColor: "action.hover",
            borderRadius: 0,
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isCollapsed ? 0 : 3,
            justifyContent: "center",
            transition: "margin 0.2s ease-in-out",
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={label}
          sx={{
            opacity: isCollapsed ? 0 : 1,
            transition: "opacity 0.2s ease-in-out",
          }}
        />
      </ListItemButton>
    </ListItem>
  );

  if (isCollapsed) {
    return (
      <Tooltip title={label} placement="right" arrow>
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default SidebarItem;
