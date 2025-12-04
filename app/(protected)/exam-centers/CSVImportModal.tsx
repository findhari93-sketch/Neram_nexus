"use client";

import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  LinearProgress,
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

export default function CSVImportModal({
  onClose,
  onImportComplete,
}: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Download Template", "Upload File", "Review & Import"];

  // Download template
  const handleDownloadTemplate = () => {
    const csvContent = generateCSVTemplate();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "exam_centers_import_template.csv";
    link.click();
    setActiveStep(1);
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

      // Show first 5 rows as preview
      const previewRows = parseResult.rows
        .slice(0, 5)
        .map((row) => csvRowToExamCenter(row));
      setPreview(previewRows);
      setActiveStep(2);
    } catch (err) {
      setError("Failed to read CSV file");
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const text = await file.text();
      const parseResult = parseCSV(text);

      if (!parseResult.success) {
        setError(parseResult.error || "Failed to parse CSV");
        setImporting(false);
        return;
      }

      // Validate all rows
      const examCenters = parseResult.rows.map((row) =>
        csvRowToExamCenter(row)
      );
      const validationResult = validateExamCenters(examCenters);

      // Import valid records
      let success = 0;
      let failed = 0;
      const importErrors: string[] = [];

      for (let i = 0; i < validationResult.processedCount; i++) {
        try {
          const centerData = examCenters[i];

          // Send to API
          const res = await fetch("/api/exam-centers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(centerData),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to create center");
          }

          success++;
        } catch (err: any) {
          failed++;
          importErrors.push(`Row ${i + 2}: ${err.message || "Unknown error"}`);
        }
      }

      // Add validation errors
      validationResult.errors.forEach((err) => {
        importErrors.push(`Row ${err.row}: ${err.error}`);
      });

      setResult({
        success,
        failed: failed + validationResult.errors.length,
        errors: importErrors,
      });

      if (success > 0 && failed === 0 && validationResult.errors.length === 0) {
        setTimeout(() => {
          onImportComplete();
        }, 2000);
      }
    } catch (err) {
      setError("Failed to import CSV file");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
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
              Import Exam Centers
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Upload a CSV file to bulk import centers
            </Typography>
          </Box>
        </Stack>
        <Button
          onClick={onClose}
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
              Download the CSV template to see the correct format and
              instructions
            </Alert>

            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    What you'll get:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Pre-filled example with all required fields
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Column headers and data types
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Instructions for each field
                  </Typography>
                </Box>
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
              Select your CSV file to continue
            </Alert>

            {/* File Upload Area */}
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

            {error && (
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

        {/* Step 3: Review & Import */}
        {activeStep === 2 && (
          <Stack spacing={3}>
            {/* Preview Table */}
            {preview.length > 0 && !result && (
              <>
                <Alert
                  icon={<InfoIcon />}
                  severity="info"
                  sx={{ borderRadius: 2 }}
                >
                  Preview of first 5 rows. Click import to process all data.
                </Alert>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Center Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Exam Type
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {preview.map((row, i) => (
                        <TableRow key={i}>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Results */}
            {result && (
              <Stack spacing={2}>
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
                            {err}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  </Paper>
                )}
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "grey.50",
        }}
      >
        <Button onClick={onClose} variant={result ? "contained" : "outlined"}>
          {result ? "Close" : "Cancel"}
        </Button>
        {!result && activeStep < steps.length - 1 && (
          <Button
            variant="contained"
            onClick={() => setActiveStep(activeStep + 1)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Next
          </Button>
        )}
        {activeStep === steps.length - 1 && !result && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!file || importing}
            startIcon={
              importing ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CloudUploadIcon />
              )
            }
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {importing ? "Importing..." : "Import Centers"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
