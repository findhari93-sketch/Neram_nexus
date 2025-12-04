"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
} from "material-react-table";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  CircularProgress,
  Stack,
  Fab,
  Paper,
  Typography,
  Divider,
  Badge,
  Slide,
  Zoom,
  Card,
  CardContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ErrorIcon from "@mui/icons-material/Error";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { ExamCenter } from "@/data/types";
import CSVImportModalEnhanced from "./CSVImportModalEnhanced";
import ExamCenterFilters, {
  type FilterState,
} from "@/app/components/exam-centers/ExamCenterFilters";
import {
  examCentersToCSV,
  downloadCSV,
  getDateForFilename,
} from "@/lib/utils/csv-download";

interface PaginationState {
  page: number;
  limit: number;
}

export default function ExamCentersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [globalFilter, setGlobalFilter] = useState("");
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<ExamCenter | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
  });
  const [filters, setFilters] = useState<FilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Fetch exam centers from API
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "exam_centers",
      pagination.page,
      pagination.limit,
      globalFilter,
      filters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(globalFilter && { search: globalFilter }),
        ...(filters.exam_type && { exam_type: filters.exam_type }),
        ...(filters.state && { state: filters.state }),
        ...(filters.status &&
          filters.status.length > 0 && { status: filters.status[0] }),
      });

      const res = await fetch(`/api/exam-centers?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch exam centers");
      }
      return res.json();
    },
  });

  const centers = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 0;

  // Delete single center mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/exam-centers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete exam center");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam_centers"] });
      setDeleteDialogOpen(false);
      setSelectedCenter(null);
    },
  });

  // Delete bulk centers mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const promises = ids.map((id) =>
        fetch(`/api/exam-centers/${id}`, { method: "DELETE" })
      );
      const responses = await Promise.all(promises);
      const failedCount = responses.filter((r) => !r.ok).length;
      if (failedCount > 0) {
        throw new Error(`Failed to delete ${failedCount} center(s)`);
      }
      return { deletedCount: ids.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam_centers"] });
      setBulkDeleteDialogOpen(false);
      setSelectedRows(new Set());
    },
  });

  const handleDelete = async () => {
    if (selectedCenter) {
      await deleteMutation.mutateAsync(selectedCenter.id);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedRows);
    await bulkDeleteMutation.mutateAsync(ids);
  };

  const handleBulkExport = useCallback(() => {
    const selectedCenters: ExamCenter[] = centers.filter((c: ExamCenter) =>
      selectedRows.has(c.id)
    );
    if (selectedCenters.length > 0) {
      const csv = examCentersToCSV(selectedCenters);
      const filename = `exam-centers-${getDateForFilename()}.csv`;
      downloadCSV(csv, filename);
    }
  }, [centers, selectedRows]);

  // Column definitions
  const columns = useMemo<MRT_ColumnDef<ExamCenter>[]>(
    () => [
      {
        accessorKey: "center_name",
        header: "Center Name",
        size: 220,
        Cell: ({ row }) => (
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {row.original.center_name}
            </Typography>
            {row.original.center_code && (
              <Chip
                label={`Code: ${row.original.center_code}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            )}
          </Stack>
        ),
      },
      {
        accessorKey: "exam_type",
        header: "Exam Type",
        size: 120,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>()}
            size="small"
            color={cell.getValue<string>() === "NATA" ? "primary" : "secondary"}
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        accessorKey: "state",
        header: "Location",
        size: 180,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 16, color: "action.disabled" }} />
            <Typography variant="body2" color="text.secondary">
              {row.original.city}, {row.original.state}
            </Typography>
          </Stack>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const configs: Record<
            string,
            { color: "success" | "default" | "error"; label: string }
          > = {
            active: { color: "success", label: "Active" },
            inactive: { color: "default", label: "Inactive" },
            discontinued: { color: "error", label: "Discontinued" },
          };
          const config = configs[status] || configs.inactive;
          return (
            <Chip
              label={config.label}
              color={config.color}
              size="small"
              sx={{ fontWeight: 500 }}
            />
          );
        },
      },
      {
        accessorKey: "phone_number",
        header: "Contact",
        size: 150,
        Cell: ({ row }) => (
          <Stack spacing={0.5}>
            {row.original.phone_number && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <PhoneIcon sx={{ fontSize: 12, color: "action.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  {row.original.phone_number}
                </Typography>
              </Stack>
            )}
            {row.original.email && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <EmailIcon sx={{ fontSize: 12, color: "action.disabled" }} />
                <Typography
                  variant="caption"
                  component="a"
                  href={`mailto:${row.original.email}`}
                  sx={{
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {row.original.email}
                </Typography>
              </Stack>
            )}
          </Stack>
        ),
      },
      {
        accessorKey: "is_confirmed_current_year",
        header: "Current Year",
        size: 120,
        Cell: ({ cell }) =>
          cell.getValue<boolean>() ? (
            <Chip
              label="Confirmed"
              size="small"
              color="success"
              variant="filled"
              sx={{ fontWeight: 500 }}
            />
          ) : (
            <Chip
              label="Not Confirmed"
              size="small"
              variant="outlined"
              color="default"
            />
          ),
      },
      {
        accessorKey: "active_years",
        header: "Years",
        size: 200,
        Cell: ({ cell }) => (
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {(cell.getValue<number[]>() || []).map((year) => (
              <Chip
                key={year}
                label={year}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            ))}
          </Stack>
        ),
      },
    ],
    []
  );

  // Table instance
  const table = useMaterialReactTable({
    columns,
    data: centers,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => router.push(`/exam-centers/${row.original.id}`)}
            sx={{
              color: "primary.main",
              "&:hover": { bgcolor: "primary.lighter" },
            }}
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => {
              setSelectedCenter(row.original);
              setDeleteDialogOpen(true);
            }}
            sx={{
              color: "error.main",
              "&:hover": { bgcolor: "error.lighter" },
            }}
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
    muiTableContainerProps: { sx: { maxHeight: "600px" } },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50],
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: { borderRadius: 0 },
    },
    initialState: {
      columnVisibility: {
        phone_number: false,
      },
      columnPinning: {
        left: ["mrt-row-expand", "center_name"],
        right: ["mrt-row-actions"],
      },
    },
  });

  const hasSelectedRows = selectedRows.size > 0;
  const activeFilterCount = Object.values(filters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : !!v
  ).length;

  // Loading state during hydration
  if (!mounted) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "grey.50",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      {/* Modern Header with Gradient */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 0,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            maxWidth: "xl",
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 4 },
            py: 4,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Exam Centers
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Manage NATA and JEE exam center information
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["exam_centers"],
                    })
                  }
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => setShowCSVModal(true)}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.5)",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Import CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={Link}
                href="/exam-centers/new"
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                Add Center
              </Button>
            </Stack>
          </Stack>

          {/* Stats Cards */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 3 }}
          >
            <Card
              sx={{
                flex: 1,
                bgcolor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Total Centers
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  {response?.pagination?.total || 0}
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                flex: 1,
                bgcolor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Active Centers
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  {
                    centers.filter((c: ExamCenter) => c.status === "active")
                      .length
                  }
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                flex: 1,
                bgcolor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Selected
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  {selectedRows.size}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Paper>

      {/* Content */}
      <Box
        sx={{ maxWidth: "xl", mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 3 }}
      >
        {/* Error Alert */}
        {error && (
          <Slide direction="down" in={!!error}>
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() =>
                queryClient.invalidateQueries({ queryKey: ["exam_centers"] })
              }
            >
              Failed to load exam centers. Please try again.
            </Alert>
          </Slide>
        )}

        {/* Filters Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 2,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.50",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Badge badgeContent={activeFilterCount} color="primary">
                <FilterListIcon />
              </Badge>
              <Typography variant="subtitle1" fontWeight={600}>
                Filters
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {filtersOpen ? "Click to collapse" : "Click to expand"}
            </Typography>
          </Box>
          <Divider />
          <ExamCenterFilters
            onFilterChange={setFilters}
            isOpen={filtersOpen}
            onOpenChange={setFiltersOpen}
          />
        </Paper>

        {/* Bulk Actions Bar */}
        <Zoom in={hasSelectedRows}>
          <Alert
            severity="info"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Stack direction="row" gap={1}>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleBulkExport}
                  variant="outlined"
                >
                  Export
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  variant="contained"
                >
                  Delete ({selectedRows.size})
                </Button>
              </Stack>
            }
          >
            <strong>{selectedRows.size}</strong> center(s) selected
          </Alert>
        </Zoom>

        {/* Search and Tools */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              placeholder="Search centers by name, city, or state..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "action.disabled" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: "grey.50", borderRadius: 1 }}
            />
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Tooltip title="Show/Hide Columns">
                <Box>
                  <MRT_ShowHideColumnsButton table={table} />
                </Box>
              </Tooltip>
              <Tooltip title="Toggle Density">
                <Box>
                  <MRT_ToggleDensePaddingButton table={table} />
                </Box>
              </Tooltip>
              <Tooltip title="Full Screen">
                <Box>
                  <MRT_ToggleFullScreenButton table={table} />
                </Box>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {/* Table */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400,
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={48} />
                <Typography color="text.secondary">
                  Loading exam centers...
                </Typography>
              </Stack>
            </Box>
          ) : centers.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400,
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <ViewModuleIcon
                  sx={{ fontSize: 64, color: "action.disabled" }}
                />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  fontWeight={500}
                >
                  No exam centers found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get started by adding your first exam center
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  component={Link}
                  href="/exam-centers/new"
                  sx={{ mt: 2 }}
                >
                  Add First Center
                </Button>
              </Stack>
            </Box>
          ) : (
            <MaterialReactTable table={table} />
          )}
        </Paper>

        {/* Pagination Info */}
        {!isLoading && centers.length > 0 && (
          <Box
            sx={{
              mt: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                response?.pagination?.total || 0
              )}{" "}
              of {response?.pagination?.total || 0} centers
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    page: Math.max(1, p.page - 1),
                  }))
                }
              >
                Previous
              </Button>
              <Chip
                label={`Page ${pagination.page} of ${totalPages}`}
                color="primary"
                variant="outlined"
              />
              <Button
                size="small"
                variant="outlined"
                disabled={pagination.page >= totalPages}
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    page: Math.min(totalPages, p.page + 1),
                  }))
                }
              >
                Next
              </Button>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Floating Action Button for Mobile */}
      <Zoom in={!isLoading}>
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            display: { sm: "none" },
          }}
          component={Link}
          href="/exam-centers/new"
        >
          <AddIcon />
        </Fab>
      </Zoom>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: { xs: "90%", sm: 400 } },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ErrorIcon color="error" />
            <Typography variant="h6" fontWeight={600}>
              Delete Exam Center?
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography color="text.secondary">
            Are you sure you want to delete{" "}
            <strong>{selectedCenter?.center_name}</strong>? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            startIcon={
              deleteMutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: { xs: "90%", sm: 400 } },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ErrorIcon color="error" />
            <Typography variant="h6" fontWeight={600}>
              Delete {selectedRows.size} Exam Center(s)?
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography color="text.secondary">
            Are you sure you want to delete <strong>{selectedRows.size}</strong>{" "}
            selected center(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBulkDeleteDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkDelete}
            color="error"
            variant="contained"
            disabled={bulkDeleteMutation.isPending}
            startIcon={
              bulkDeleteMutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteOutlineIcon />
              )
            }
          >
            {bulkDeleteMutation.isPending ? "Deleting..." : "Delete All"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Import Modal */}
      {showCSVModal && (
        <CSVImportModalEnhanced
          onClose={() => setShowCSVModal(false)}
          onImportComplete={() => {
            setShowCSVModal(false);
            queryClient.invalidateQueries({ queryKey: ["exam_centers"] });
          }}
        />
      )}
    </Box>
  );
}
