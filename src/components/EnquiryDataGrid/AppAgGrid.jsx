import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  forwardRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./AppAgGrid.css";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Popover,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ActionModeToolbar from "./ActionModeToolbar";
import DefaultToolbar from "./DefaultToolbar";
import FlipHeader from "./FlipHeader";

/**
 * Reusable AG Grid Wrapper
 * Props:
 *  - rowData
 *  - columnDefs
 *  - loading
 *  - quickFilter (boolean)
 *  - pagination (boolean)
 *  - pageSize (number)
 *  - enableSelection (boolean)
 *  - onSelectionChange(count, rows)
 *  - height (number|string)
 *  - toolbarExtra (ReactNode) (deprecated in favor of integrated action bar)
 *  - title (string)
 *  - breadcrumbs (array of { label, active? })
 *  - onBack (function)
 *  - showDateFilter (bool)
 *  - initialDateRange ({ startDate: Date, endDate: Date })
 *  - onDateRangeChange(startDate, endDate)
 *  - onSearch (val) OR internal quick filter popover
 *  - onAddClick()
 *  - onDeleteClick()
 *  - onLoadClick()
 *  - onExportClick(fileName?) (falls back to grid export)
 */
const AppAgGrid = forwardRef(function AppAgGrid(
  {
    rowData = [],
    columnDefs = [],
    loading = false,
    quickFilter = true,
    pagination = true,
    pageSize = 25,
    enableSelection = false,
    onSelectionChange,
    height = 520,
    toolbarExtra,
    autoSizeStrategy = "fit", // 'fit' | 'sizeColumnsToFit' | 'autoSizeAll'
    dense = false,
    showColumnFilters = false,
    onRowClick,
    // New props for integrated action bar
    title = "",
    breadcrumbs = [],
    onBack,
    showDateFilter = false,
    initialDateRange,
    onDateRangeChange,
    onAddClick,
    onDeleteClick,
    onLoadClick,
    onExportClick,
  },
  ref
) {
  const gridApiRef = useRef(null);
  const gridColumnApiRef = useRef(null);
  const wrapperRef = useRef(null);
  const quickFilterRef = useRef("");
  const [searchAnchor, setSearchAnchor] = React.useState(null);
  const searchOpen = Boolean(searchAnchor);
  const openSearch = (e) => setSearchAnchor(e.currentTarget);
  const closeSearch = () => setSearchAnchor(null);

  // Action mode & deletion state
  const [actionMode, setActionMode] = useState(false);
  const [localData, setLocalData] = useState(rowData);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);

  // Sync local data if parent rowData changes (only when not in action mode)
  React.useEffect(() => {
    if (!actionMode) setLocalData(rowData);
  }, [rowData, actionMode]);

  // Unified date filter state (range object) if enabled
  const [range, setRange] = React.useState(() => {
    if (initialDateRange?.startDate && initialDateRange?.endDate) {
      return {
        start: initialDateRange.startDate,
        end: initialDateRange.endDate,
      };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today); // same day
    return { start: today, end };
  });
  const handleRangeChange = (r) => {
    setRange(r);
    onDateRangeChange && onDateRangeChange(r.start, r.end);
  };

  // Currently styling handled purely via CSS class; config retained if needed.
  const internalColDefs = useMemo(() => {
    // Base edit icon column (always reserve space) - icon only shows on row hover & when not in action mode
    const editCol = {
      headerName: "",
      field: "__edit__",
      maxWidth: 44,
      width: 44,
      resizable: false,
      sortable: false,
      filter: false,
      pinned: "left",
      suppressHeaderMenuButton: true,
      cellRenderer: (params) => {
        if (actionMode) return ""; // hide in action mode
        return (
          <span
            className="app-grid-edit-icon"
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <IconButton
              size="small"
              aria-label="Edit row"
              onClick={(e) => {
                e.stopPropagation();
                onRowClick &&
                  onRowClick(params.data, {
                    api: params.api,
                    node: params.node,
                  });
              }}
            >
              <EditIcon fontSize="inherit" />
            </IconButton>
          </span>
        );
      },
    };

    // If action mode selection column is needed we prepend it before data columns but after edit column? Requirement: edit icon on left side; also selection column appears only in action mode currently; we want selection checkbox first then edit? User asked edit icon column at beginning (left). Keep edit as first, then selection when actionMode.

    const cols = [...columnDefs];

    if (actionMode) {
      const selectionCol = {
        headerName: "",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        maxWidth: 48,
        resizable: false,
        sortable: false,
        filter: false,
        pinned: "left",
      };
      return [selectionCol, ...cols]; // edit column removed in action mode
    }
    return [editCol, ...cols];
  }, [columnDefs, actionMode, onRowClick]);

  useImperativeHandle(ref, () => ({
    columnApi: () => gridColumnApiRef.current,
    sizeToFit: () => gridApiRef.current?.sizeColumnsToFit(),
    exportCsv: (fileName = "export.csv") =>
      gridApiRef.current?.exportDataAsCsv({ fileName }),
    refresh: () => gridApiRef.current?.refreshClientSideRowModel?.(),
  }));

  const handleGridReady = useCallback(
    (params) => {
      gridApiRef.current = params.api;
      gridColumnApiRef.current = params.columnApi;

      // initial sizing
      if (
        autoSizeStrategy === "sizeColumnsToFit" ||
        autoSizeStrategy === "fit"
      ) {
        params.api.sizeColumnsToFit();
      } else if (autoSizeStrategy === "autoSizeAll") {
        const all = [];
        params.columnApi.getColumns()?.forEach((c) => all.push(c));
        params.columnApi.autoSizeColumns(all, false);
      }

      // scroll shadow class for pinned columns
      const updateScroll = () => {
        const range = params.api.getHorizontalPixelRange();
        if (!wrapperRef.current) return;
        if (range.left > 0)
          wrapperRef.current.classList.add("has-h-scroll-left");
        else wrapperRef.current.classList.remove("has-h-scroll-left");
      };
      params.api.addEventListener("bodyScroll", updateScroll);
      updateScroll();
    },
    [autoSizeStrategy]
  );

  const handleSelectionChanged = useCallback(() => {
    const rows = gridApiRef.current?.getSelectedRows?.() || [];
    setSelectionCount(rows.length);
    onSelectionChange && onSelectionChange(rows.length, rows);
  }, [onSelectionChange]);

  const onQuickFilterChange = (e) => {
    const val = e.target.value;
    quickFilterRef.current = val;
    gridApiRef.current?.setGridOption("quickFilterText", val);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Toolbar with FlipHeader Animation */}
        <FlipHeader
          flipped={actionMode}
          height={60}
          front={
            <DefaultToolbar
              title={title}
              breadcrumbs={breadcrumbs}
              onBack={onBack}
              recordCount={localData.length}
              showDateFilter={showDateFilter}
              dateRange={range}
              onDateRangeChange={handleRangeChange}
              onSearchClick={openSearch}
              onAddClick={onAddClick}
              onDeleteClick={() => setActionMode(true)}
              onLoadClick={onLoadClick}
              onExportClick={() => {
                if (onExportClick) onExportClick();
                else gridApiRef.current?.exportDataAsCsv?.();
              }}
            />
          }
          back={
            <ActionModeToolbar
              selectionCount={selectionCount}
              onDeleteClick={() => {
                setDeleteDialogOpen(true);
                setConfirmDeleteChecked(false);
              }}
              onClose={() => {
                setActionMode(false);
                gridApiRef.current?.deselectAll();
                setSelectionCount(0);
              }}
            />
          }
        />
        <Box
          className="app-grid-wrapper"
          ref={wrapperRef}
          sx={{ height, display: "flex", flexDirection: "column" }}
        >
          {/* Search Popover */}
          <Popover
            open={searchOpen}
            anchorEl={searchAnchor}
            onClose={closeSearch}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Box
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                minWidth: 260,
              }}
            >
              <TextField
                size="small"
                placeholder="Search..."
                autoFocus
                onChange={(e) => {
                  onQuickFilterChange(e);
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    gridApiRef.current?.setGridOption("quickFilterText", "");
                    closeSearch();
                  }}
                >
                  Clear
                </Button>
                <Button size="small" variant="contained" onClick={closeSearch}>
                  Close
                </Button>
              </Box>
            </Box>
          </Popover>
          <div style={{ flex: 1 }} className="ag-theme-quartz app-grid-theme">
            <AgGridReact
              rowData={localData}
              columnDefs={internalColDefs}
              floatingFiltersHeight={showColumnFilters ? 34 : undefined}
              suppressMenuHide
              rowSelection={actionMode ? "multiple" : undefined}
              suppressRowClickSelection={actionMode}
              pagination={pagination}
              paginationPageSize={pageSize}
              paginationPageSizeSelector={[10, 25, 50, 100]}
              enableCellTextSelection
              onGridReady={handleGridReady}
              onSelectionChanged={handleSelectionChanged}
              onRowClicked={(e) => {
                if (actionMode) {
                  const node = e.node;
                  node.setSelected(!node.isSelected());
                } else {
                  onRowClick && onRowClick(e.data, e);
                }
              }}
              defaultColDef={{
                sortable: true,
                resizable: true,
                filter: true,
                floatingFilter: showColumnFilters,
                flex: 1,
                minWidth: 140,
                wrapHeaderText: true,
                autoHeaderHeight: true,
                suppressHeaderMenuButton: true,
              }}
            />
          </div>
        </Box>
      </Box>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 0 }}>Confirm Deletion</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>
            You are about to delete the following {selectionCount} record(s):
          </Typography>
          <List dense sx={{ maxHeight: 200, overflowY: "auto", mb: 1 }}>
            {(gridApiRef.current?.getSelectedRows() || []).map((r, idx) => (
              <ListItem key={idx} sx={{ py: 0.25 }}>
                <Typography variant="caption" noWrap>
                  {JSON.stringify(r)}
                </Typography>
              </ListItem>
            ))}
          </List>
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmDeleteChecked}
                onChange={(e) => setConfirmDeleteChecked(e.target.checked)}
              />
            }
            label={
              <Typography variant="caption">
                I understand this action cannot be undone.
              </Typography>
            }
          />
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            disabled={!confirmDeleteChecked || selectionCount === 0}
            onClick={() => {
              const selected = gridApiRef.current?.getSelectedRows() || [];
              if (selected.length) {
                // Remove selected from local data
                setLocalData((prev) =>
                  prev.filter((r) => !selected.includes(r))
                );
              }
              setDeleteDialogOpen(false);
              setConfirmDeleteChecked(false);
              setSelectionCount(0);
              gridApiRef.current?.deselectAll();
              setActionMode(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default AppAgGrid;
