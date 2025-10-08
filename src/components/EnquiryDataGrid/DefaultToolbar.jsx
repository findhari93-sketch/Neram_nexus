import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import DateFilter from "../../components/DateFilter/DateFilter";

/**
 * Default Toolbar Component
 * Displayed when the grid is in normal (non-action) mode
 *
 * Props:
 *  - title: Page title
 *  - breadcrumbs: Array of { label, active? }
 *  - onBack: Function to call when back button is clicked
 *  - recordCount: Total number of records
 *  - showDateFilter: Whether to show date filter
 *  - dateRange: Current date range { start, end }
 *  - onDateRangeChange: Function to call when date range changes
 *  - onSearchClick: Function to call when search button is clicked
 *  - onAddClick: Function to call when add button is clicked
 *  - onDeleteClick: Function to call when delete button is clicked (enters action mode)
 *  - onLoadClick: Function to call when load button is clicked
 *  - onExportClick: Function to call when export button is clicked
 */
const DefaultToolbar = ({
  title = "",
  breadcrumbs = [],
  onBack,
  recordCount = 0,
  showDateFilter = false,
  dateRange,
  onDateRangeChange,
  onSearchClick,
  onAddClick,
  onDeleteClick,
  onLoadClick,
  onExportClick,
}) => {
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
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ minWidth: 260 }}
      >
        {onBack && (
          <IconButton size="small" onClick={onBack}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Box>
          {title && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}{" "}
              <Typography
                component="span"
                variant="caption"
                sx={{ ml: 1, fontWeight: 400 }}
                color="text.primary"
              >
                {recordCount.toLocaleString()} Records
              </Typography>
            </Typography>
          )}
          {!!breadcrumbs?.length && (
            <Typography variant="caption" color="text.primary">
              {breadcrumbs.map((b, idx) => (
                <span
                  key={idx}
                  style={{ color: b.active ? "#1565c0" : undefined }}
                >
                  {b.label}
                  {idx < breadcrumbs.length - 1 && " › "}
                </span>
              ))}
            </Typography>
          )}
        </Box>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ flexWrap: "wrap" }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {showDateFilter && (
            <DateFilter value={dateRange} onChange={onDateRangeChange} />
          )}
        </Stack>
        {showDateFilter && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", sm: "block" } }}
          />
        )}
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Search">
            <IconButton size="small" onClick={onSearchClick}>
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add New">
            <IconButton size="small" color="primary" onClick={onAddClick}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {/* Delete button toggles action mode */}
          <Tooltip title="Delete / Select Rows">
            <IconButton size="small" color="error" onClick={onDeleteClick}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Load">
            <span>
              <IconButton
                size="small"
                onClick={onLoadClick}
                disabled={!onLoadClick}
              >
                <CloudUploadIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton size="small" onClick={onExportClick}>
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default DefaultToolbar;
