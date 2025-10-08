import React from "react";
import { Box, IconButton, Tooltip, Typography, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * Action Mode Toolbar Component
 * Displayed when the grid is in action/selection mode
 *
 * Props:
 *  - selectionCount: Number of selected rows
 *  - onDeleteClick: Function to call when delete button is clicked
 *  - onClose: Function to call when close button is clicked
 */
const ActionModeToolbar = ({ selectionCount = 0, onDeleteClick, onClose }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      className="app-grid-toolbar"
      sx={{
        flexWrap: "wrap",
        gap: 2,
        justifyContent: "space-between",
        minHeight: 60,
        py: 1,
        bgcolor: (theme) => theme.palette.warning.light,
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Action Mode
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flexGrow: 1 }}
      >
        <Tooltip title="Delete selected">
          <span>
            <IconButton
              size="small"
              color={selectionCount > 0 ? "error" : "default"}
              disabled={selectionCount === 0}
              onClick={onDeleteClick}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          {selectionCount} selected
        </Typography>
      </Stack>
      <Box sx={{ ml: "auto" }}>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default ActionModeToolbar;
