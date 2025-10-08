import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Popover,
  Stack,
  Typography,
  Divider,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import {
  resolvePreset,
  rangeLabel,
  getPreviousPeriod,
  isSameDay,
  startOfDay,
  endOfDay,
} from "./dateFilterUtils";

/**
 * Advanced Date Range Filter with calendar UI
 * - Presets (Today, Yesterday, Last 7/30/90 days, etc.)
 * - Custom range picker with hover preview
 * - Optional compare mode
 */
export default function DateFilter({ value, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const calendarRef = useRef(null);

  // Current range state
  const [current, setCurrent] = useState(
    value || { start: new Date(), end: new Date() }
  );

  // Custom range draft (when user picks dates)
  const [customDraft, setCustomDraft] = useState(null);
  const [pickingEnd, setPickingEnd] = useState(false); // two-click range selection
  const [hoveredDate, setHoveredDate] = useState(null);

  // Compare toggle
  const [compareOn, setCompareOn] = useState(false);

  // Sync with parent value
  useEffect(() => {
    if (value) setCurrent(value);
  }, [value]);

  // Auto-scroll calendar to show current (newest) month at bottom when opening
  useEffect(() => {
    if (!open || !calendarRef.current) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;

    const tryScroll = () => {
      if (cancelled || !calendarRef.current) return;

      const container = calendarRef.current;
      const targetScroll = container.scrollHeight - container.clientHeight;
      const currentScroll = container.scrollTop;
      const remaining = Math.abs(targetScroll - currentScroll);

      // Set to bottom
      container.scrollTop = targetScroll;

      attempts++;

      // If we're not at the bottom yet and haven't exhausted attempts, schedule retry
      if (remaining > 5 && attempts < maxAttempts) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(tryScroll, 40);
          });
        });
      }
    };

    // Initial attempt after a brief delay for layout
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(tryScroll, 50);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setCustomDraft(null);
    setPickingEnd(false);
    setHoveredDate(null);
  };

  // Apply currently drafted (customDraft or current) range to parent and close
  const commitAndClose = () => {
    const range = customDraft || current;
    if (range?.start && range?.end) {
      setCurrent(range);
      onChange && onChange(range);
    }
    handleClose();
  };

  const handlePresetClick = (presetKey) => {
    const range = resolvePreset(presetKey);
    if (range) {
      // Set as draft but do not auto-apply; allow user to hit Apply
      setCustomDraft(range);
      setPickingEnd(false);
    }
  };

  const handleDateClick = (date) => {
    if (!pickingEnd) {
      // First click: start new draft range
      setCustomDraft({ start: date, end: date });
      setPickingEnd(true);
    } else {
      const start = customDraft.start;
      if (date >= start) {
        // Complete draft forward
        setCustomDraft({ start, end: date });
        setPickingEnd(false); // Finished selection; wait for Apply
      } else {
        // Restart from earlier date
        setCustomDraft({ start: date, end: date });
      }
    }
  };

  // Presets
  const presets = [
    { label: "Today", key: "today" },
    { label: "Yesterday", key: "yesterday" },
    { label: "Last 7 days", key: "last7days" },
    { label: "Last 30 days", key: "last30days" },
    { label: "Last 90 days", key: "last90days" },
    { label: "This Month", key: "thisMonth" },
    { label: "Last Month", key: "lastMonth" },
    { label: "This Year", key: "thisYear" },
  ];

  // Generate 12 months of calendar (oldest at top, newest at bottom)
  const generateMonths = () => {
    const today = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(d);
    }
    return months;
  };

  const monthsToShow = generateMonths();

  // Check if a date is in the selected range
  const isInRange = (date) => {
    const rangeToCheck = customDraft || current;
    if (!rangeToCheck?.start || !rangeToCheck?.end) return false;
    return (
      date >= startOfDay(rangeToCheck.start) &&
      date <= endOfDay(rangeToCheck.end)
    );
  };

  const isStartDate = (date) => {
    const rangeToCheck = customDraft || current;
    return rangeToCheck?.start && isSameDay(date, rangeToCheck.start);
  };

  const isEndDate = (date) => {
    const rangeToCheck = customDraft || current;
    return rangeToCheck?.end && isSameDay(date, rangeToCheck.end);
  };

  // Hover preview range (only forward from draft start)
  const isInHoverPreview = (date) => {
    if (!pickingEnd || !customDraft?.start || !hoveredDate) return false;
    if (hoveredDate < customDraft.start) return false; // no preview for backward hover
    return (
      date >= startOfDay(customDraft.start) && date <= endOfDay(hoveredDate)
    );
  };

  const renderMonth = (monthStart) => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const daysInMonth = lastDay.getDate();
    const weeks = [];
    let week = [];

    // Fill leading empty cells
    for (let i = 0; i < startDayOfWeek; i++) {
      week.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      week.push(date);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    // Fill trailing empty cells
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    const monthLabel = firstDay.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return (
      <Box key={`${year}-${month}`} sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, mb: 0.5, display: "block", pl: 0.5 }}
        >
          {monthLabel}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "2px",
            width: "100%",
          }}
        >
          {weeks.map((wk, wkIdx) => (
            <React.Fragment key={wkIdx}>
              {wk.map((dt, cellIdx) => {
                if (!dt)
                  return <Box key={`empty-${cellIdx}`} sx={{ height: 28 }} />;

                const isStart = isStartDate(dt);
                const isEnd = isEndDate(dt);
                const inRange = isInRange(dt);
                const inPreview = isInHoverPreview(dt);
                const isToday = isSameDay(dt, new Date());

                return (
                  <Box
                    key={dt.getTime()}
                    onClick={() => handleDateClick(dt)}
                    onMouseEnter={() => setHoveredDate(dt)}
                    onMouseLeave={() => setHoveredDate(null)}
                    sx={{
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      cursor: "pointer",
                      userSelect: "none",
                      borderRadius: isStart || isEnd ? "50%" : 0,
                      bgcolor:
                        isStart || isEnd
                          ? "primary.main"
                          : inRange
                          ? "primary.light"
                          : inPreview
                          ? "action.hover"
                          : "transparent",
                      color:
                        isStart || isEnd
                          ? "primary.contrastText"
                          : "text.primary",
                      fontWeight: isToday ? 700 : 400,
                      border: inPreview ? "1px dotted" : "none",
                      borderColor: inPreview ? "primary.main" : "transparent",
                      "&:hover": {
                        bgcolor:
                          isStart || isEnd ? "primary.dark" : "action.hover",
                      },
                    }}
                  >
                    {dt.getDate()}
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarTodayIcon fontSize="inherit" />}
        onClick={handleOpen}
        sx={{ textTransform: "none", minWidth: 200 }}
      >
        {rangeLabel(current)}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: { mt: 0.5, boxShadow: 3, borderRadius: 2, overflow: "hidden" },
        }}
      >
        <Stack direction="row" sx={{ width: 600, maxHeight: 560 }}>
          {/* Left: Presets */}
          <Box
            sx={{
              width: 180,
              p: 1.5,
              bgcolor: "grey.50",
              borderRight: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, mb: 0.5, px: 1 }}
            >
              Presets
            </Typography>
            {presets.map((preset) => (
              <Button
                key={preset.key}
                size="small"
                variant="text"
                onClick={() => handlePresetClick(preset.key)}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontSize: "13px",
                  px: 1,
                  py: 0.5,
                }}
              >
                {preset.label}
              </Button>
            ))}
            <Divider sx={{ my: 1 }} />
            <Tooltip title="Compare with previous period">
              <ToggleButton
                value="compare"
                size="small"
                selected={compareOn}
                onChange={() => setCompareOn((prev) => !prev)}
                sx={{ textTransform: "none", fontSize: "12px" }}
              >
                <CompareArrowsIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                Compare
              </ToggleButton>
            </Tooltip>
            {compareOn && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, px: 1 }}
              >
                vs {rangeLabel(getPreviousPeriod(current))}
              </Typography>
            )}
          </Box>

          {/* Right: Calendar */}
          <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column" }}>
            {/* Static Weekday Header */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "2px",
                mb: 1,
                position: "sticky",
                top: 0,
                bgcolor: "background.paper",
                zIndex: 1,
                pb: 0.5,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Typography
                  key={day}
                  variant="caption"
                  sx={{
                    textAlign: "center",
                    fontWeight: 600,
                    color: "text.secondary",
                    fontSize: "11px",
                  }}
                >
                  {day}
                </Typography>
              ))}
            </Box>

            {/* Scrollable Months */}
            <Box
              ref={calendarRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "grey.300",
                  borderRadius: 3,
                },
              }}
            >
              {monthsToShow.map((m) => renderMonth(m))}
            </Box>
            {/* Action Bar */}
            <Box
              sx={{
                pt: 1.5,
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  // Cancel: discard draft and close
                  setCustomDraft(null);
                  setPickingEnd(false);
                  handleClose();
                }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!(customDraft?.start && customDraft?.end)}
                onClick={commitAndClose}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Stack>
      </Popover>
    </>
  );
}
