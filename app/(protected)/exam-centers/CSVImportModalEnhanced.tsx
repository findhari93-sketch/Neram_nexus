"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  Alert,
  Chip,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  FileUpload as FileUploadIcon,
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { parseCSV, csvRowToExamCenter } from "@/lib/utils/csv-parser";
import {
  validateExamCenters,
  getValidationSummary,
} from "@/lib/utils/csv-validator";
import { generateCSVTemplate } from "@/lib/utils/csv-download";

interface CSVImportModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface EditingRow {
  id: string;
  data: any;
}

export default function CSVImportModalEnhanced({
  onClose,
  onImportComplete,
}: CSVImportModalProps) {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    "Download Template",
    "Upload File",
    "Review & Edit",
    "Confirm Import",
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Download template
  const handleDownloadTemplate = () => {
    try {
      const csvContent = generateCSVTemplate();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "exam_centers_import_template.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setActiveStep(1);
    } catch (err) {
      console.error("Error downloading template:", err);
      setError(
        "Failed to download template: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    try {
      const text = await selectedFile.text();
      const parseResult = parseCSV(text);

      if (!parseResult.success) {
        setError(parseResult.error || "Failed to parse CSV");
        return;
      }

      // Parse all rows and add IDs for editing
      const allRows = parseResult.rows.map((row, idx) => ({
        id: `row-${idx}`,
        ...csvRowToExamCenter(row),
      }));

      setPreview(allRows);
      setActiveStep(2);
    } catch (err) {
      setError(
        "Failed to read CSV file: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleStartEdit = (rowId: string) => {
    const rowData = preview.find((r) => r.id === rowId);
    if (rowData) {
      setEditingRowId(rowId);
      setEditingData({ ...rowData });
    }
  };

  const handleSaveEdit = () => {
    if (!editingRowId || !editingData) return;

    const updatedPreview = preview.map((row) =>
      row.id === editingRowId ? editingData : row
    );
    setPreview(updatedPreview);
    setEditingRowId(null);
    setEditingData(null);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingData(null);
  };

  const handleDeleteRow = (rowId: string) => {
    setPreview(preview.filter((r) => r.id !== rowId));
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      setError("No data to import");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      let success = 0;
      let failed = 0;
      const importErrors: string[] = [];

      for (const row of preview) {
        try {
          // Remove the ID before sending to API
          const { id, ...centerData } = row;

          const res = await fetch("/api/exam-centers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(centerData),
          });

          if (!res.ok) {
            const errorData = await res.json();
            failed++;
            importErrors.push(
              `Row: ${centerData.center_name || "Unknown"} - ${
                errorData.error || "Failed to create"
              }`
            );
          } else {
            success++;
          }
        } catch (err) {
          failed++;
          importErrors.push(
            `Row error: ${err instanceof Error ? err.message : "Unknown error"}`
          );
        }
      }

      setResult({
        success,
        failed,
        errors: importErrors,
      });

      setImporting(false);

      if (success > 0) {
        setTimeout(() => {
          onImportComplete();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(
        "Import failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
      setImporting(false);
    }
  };

  const isEditing = editingRowId !== null;

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: "none",
        },
      }}
    >
      {/* Header with Gradient */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <FileUploadIcon />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Bulk Import Exam Centers
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Upload and edit data before importing
            </Typography>
          </Box>
        </Stack>
        <Button
          onClick={onClose}
          disabled={importing}
          sx={{
            color: "white",
            minWidth: "auto",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ mb: 3 }} />

        {/* Step 1: Download Template */}
        {activeStep === 0 && (
          <Stack spacing={3}>
            <Alert icon={<InfoIcon />} severity="info" sx={{ borderRadius: 2 }}>
              Download the CSV template to see the correct format
            </Alert>

            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Template includes:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✓ Pre-filled examples
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✓ Required columns
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✓ Data format specifications
                </Typography>
              </Stack>
            </Card>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                Download Template
              </Button>
            </Box>
          </Stack>
        )}

        {/* Step 2: Upload File */}
        {activeStep === 1 && (
          <Stack spacing={3}>
            <Alert icon={<InfoIcon />} severity="info" sx={{ borderRadius: 2 }}>
              Select your CSV file to upload
            </Alert>

            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: "center",
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "primary.lighter",
                },
              }}
              component="label"
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <Stack spacing={2} alignItems="center">
                <CloudUploadIcon
                  sx={{ fontSize: 48, color: "action.disabled" }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Click to upload or drag and drop
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CSV files only
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {file && (
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FileUploadIcon color="success" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {error && activeStep === 1 && (
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                sx={{ borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!file}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                Next
              </Button>
            </Box>
          </Stack>
        )}

        {/* Step 3: Review & Edit */}
        {activeStep === 2 && (
          <Stack spacing={3}>
            <Alert icon={<InfoIcon />} severity="info" sx={{ borderRadius: 2 }}>
              Preview your data. Click the edit icon to modify individual rows.
              You can edit and delete rows before importing.
            </Alert>

            {error && (
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                sx={{ borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}

            {/* Data Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 600, width: 50 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Center Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Exam Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 100 }}>
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, width: 100 }}
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((row, idx) =>
                    editingRowId === row.id ? (
                      <EditingRow
                        key={row.id}
                        row={editingData}
                        rowIndex={idx + 1}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <TableRow key={row.id} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row.center_name || "-"}</TableCell>
                        <TableCell>
                          {row.exam_type && (
                            <Chip
                              label={row.exam_type}
                              size="small"
                              color={
                                row.exam_type === "NATA"
                                  ? "primary"
                                  : "secondary"
                              }
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>{row.state || "-"}</TableCell>
                        <TableCell>{row.city || "-"}</TableCell>
                        <TableCell>
                          {row.status && (
                            <Chip
                              label={row.status}
                              size="small"
                              color={
                                row.status === "active"
                                  ? "success"
                                  : row.status === "inactive"
                                  ? "default"
                                  : "error"
                              }
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleStartEdit(row.id)}
                              sx={{
                                color: "primary.main",
                                "&:hover": { bgcolor: "primary.lighter" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRow(row.id)}
                              sx={{
                                color: "error.main",
                                "&:hover": { bgcolor: "error.lighter" },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="caption" color="text.secondary">
              Total rows: {preview.length}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveStep(3)}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                Next
              </Button>
            </Box>
          </Stack>
        )}

        {/* Step 4: Confirm & Import */}
        {activeStep === 3 && (
          <Stack spacing={3}>
            {!result ? (
              <>
                <Alert
                  icon={<InfoIcon />}
                  severity="info"
                  sx={{ borderRadius: 2 }}
                >
                  Ready to import {preview.length} exam center(s). Click the
                  Import button below to proceed.
                </Alert>

                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={600}>
                          Total Records
                        </Typography>
                        <Chip
                          label={preview.length}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Box
                  sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(2)}
                    disabled={importing}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleImport}
                    disabled={importing}
                    startIcon={
                      importing ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <CloudUploadIcon />
                      )
                    }
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    {importing ? "Importing..." : "Import Now"}
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Alert
                  severity={result.failed === 0 ? "success" : "warning"}
                  icon={
                    result.failed === 0 ? <CheckCircleIcon /> : <WarningIcon />
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <Typography fontWeight={600}>Import Complete</Typography>
                  <Typography variant="body2">
                    {result.success} imported successfully
                    {result.failed > 0 && `, ${result.failed} failed`}
                  </Typography>
                </Alert>

                {result.errors.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      gutterBottom
                    >
                      Errors ({result.errors.length})
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 200,
                        overflow: "auto",
                        bgcolor: "grey.50",
                        p: 1.5,
                        borderRadius: 1,
                      }}
                    >
                      <Stack spacing={0.5}>
                        {result.errors.map((err, i) => (
                          <Typography
                            key={i}
                            variant="caption"
                            color="error"
                            sx={{ fontFamily: "monospace" }}
                          >
                            • {err}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  </Paper>
                )}

                <Box
                  sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    Close
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Inline Edit Row Component
interface EditingRowProps {
  row: any;
  rowIndex: number;
  onSave: () => void;
  onCancel: () => void;
}

function EditingRow({ row, rowIndex, onSave, onCancel }: EditingRowProps) {
  const [editRow, setEditRow] = useState(row);

  return (
    <TableRow sx={{ bgcolor: "action.hover" }}>
      <TableCell>{rowIndex}</TableCell>
      <TableCell>
        <TextField
          size="small"
          value={editRow.center_name || ""}
          onChange={(e) =>
            setEditRow({ ...editRow, center_name: e.target.value })
          }
          fullWidth
        />
      </TableCell>
      <TableCell>
        <FormControl size="small" fullWidth>
          <Select
            value={editRow.exam_type || ""}
            onChange={(e) =>
              setEditRow({ ...editRow, exam_type: e.target.value })
            }
          >
            <MenuItem value="NATA">NATA</MenuItem>
            <MenuItem value="JEE">JEE</MenuItem>
            <MenuItem value="BOTH">BOTH</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          value={editRow.state || ""}
          onChange={(e) => setEditRow({ ...editRow, state: e.target.value })}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          value={editRow.city || ""}
          onChange={(e) => setEditRow({ ...editRow, city: e.target.value })}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <FormControl size="small" fullWidth>
          <Select
            value={editRow.status || "active"}
            onChange={(e) => setEditRow({ ...editRow, status: e.target.value })}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell align="center">
        <Tooltip title="Save">
          <IconButton
            size="small"
            onClick={onSave}
            sx={{
              color: "success.main",
              "&:hover": { bgcolor: "success.lighter" },
            }}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cancel">
          <IconButton
            size="small"
            onClick={onCancel}
            sx={{
              color: "warning.main",
              "&:hover": { bgcolor: "warning.lighter" },
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
