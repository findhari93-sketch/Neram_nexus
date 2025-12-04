"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  FormGroup,
  Paper,
  Select,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import {
  INDIAN_STATES,
  EXAM_TYPES,
  CENTER_STATUS,
} from "@/data/indian-states-cities";

export interface FilterState {
  exam_type?: string;
  state?: string;
  status?: string[];
}

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ExamCenterFilters({
  onFilterChange,
  isOpen = true,
  onOpenChange,
}: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  // Handle exam type change
  const handleExamTypeChange = useCallback(
    (value: string) => {
      const newFilters = { ...filters };
      if (value) {
        newFilters.exam_type = value;
      } else {
        delete newFilters.exam_type;
      }
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  // Handle state change
  const handleStateChange = useCallback(
    (value: string) => {
      const newFilters = { ...filters };
      if (value) {
        newFilters.state = value;
      } else {
        delete newFilters.state;
      }
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  // Handle status filter toggle
  const handleStatusToggle = useCallback(
    (status: string) => {
      const newStatusFilters = statusFilters.includes(status)
        ? statusFilters.filter((s) => s !== status)
        : [...statusFilters, status];

      setStatusFilters(newStatusFilters);

      const newFilters = { ...filters };
      if (newStatusFilters.length > 0) {
        newFilters.status = newStatusFilters;
      } else {
        delete newFilters.status;
      }
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [statusFilters, filters, onFilterChange]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({});
    setStatusFilters([]);
    onFilterChange({});
  }, [onFilterChange]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.exam_type || filters.state || statusFilters.length > 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 1,
      }}
    >
      {/* Filter Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => onOpenChange?.(!isOpen)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon sx={{ fontSize: 20, color: "action.disabled" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
          {hasActiveFilters && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              {(filters.exam_type ? 1 : 0) +
                (filters.state ? 1 : 0) +
                (statusFilters.length > 0 ? 1 : 0)}
            </Box>
          )}
        </Box>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleClearFilters();
            }}
            sx={{ color: "text.secondary" }}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Filter Content */}
      <Collapse in={isOpen} timeout="auto">
        <Box sx={{ mt: 2 }}>
          {/* Exam Type Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Exam Type
            </Typography>
            <Select
              fullWidth
              size="small"
              value={filters.exam_type || ""}
              onChange={(e) => handleExamTypeChange(e.target.value)}
              displayEmpty
              sx={{ fontSize: "0.875rem" }}
            >
              <MenuItem value="">All Types</MenuItem>
              {EXAM_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* State Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              State
            </Typography>
            <Select
              fullWidth
              size="small"
              value={filters.state || ""}
              onChange={(e) => handleStateChange(e.target.value)}
              displayEmpty
              sx={{ fontSize: "0.875rem" }}
            >
              <MenuItem value="">All States</MenuItem>
              {INDIAN_STATES.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Status Filter */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Status
            </Typography>
            <FormGroup>
              {CENTER_STATUS.map((statusItem) => {
                const statusVal = statusItem.value;
                const statusLabel = statusItem.label;
                return (
                  <FormControlLabel
                    key={statusVal}
                    control={
                      <Checkbox
                        size="small"
                        checked={statusFilters.includes(statusVal)}
                        onChange={() => handleStatusToggle(statusVal)}
                      />
                    }
                    label={
                      <Typography variant="body2">{statusLabel}</Typography>
                    }
                    sx={{ mb: 0.5 }}
                  />
                );
              })}
            </FormGroup>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
