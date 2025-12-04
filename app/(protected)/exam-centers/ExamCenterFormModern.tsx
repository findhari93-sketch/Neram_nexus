"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ExamCenter, ExamCenterInput } from "@/data/types";
import {
  INDIAN_STATES,
  CITIES_BY_STATE,
  EXAM_TYPES,
  CENTER_STATUS,
  type IndianState,
} from "@/data/indian-states-cities";

import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Breadcrumbs,
  useMediaQuery,
  useTheme,
  Fade,
  Zoom,
  Autocomplete,
} from "@mui/material";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import BuildingIcon from "@mui/icons-material/Domain";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LanguageIcon from "@mui/icons-material/Language";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import HomeIcon from "@mui/icons-material/Home";

interface ExamCenterFormProps {
  centerId?: string;
}

const steps = [
  "Basic Information",
  "Location & Address",
  "Contact Details",
  "Year & Status",
  "Additional Info",
];

export default function ExamCenterFormModern({
  centerId,
}: ExamCenterFormProps) {
  const router = useRouter();
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  // Use a mobile state to avoid hydration mismatch
  const [isMobileState, setIsMobileState] = useState(false);
  const mediaQuery = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = mounted ? mediaQuery : false;
  const isEditing = !!centerId;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentYear, setCurrentYear] = useState<number>(0);

  const [formData, setFormData] = useState<ExamCenterInput>({
    exam_type: "NATA",
    state: "",
    city: "",
    center_name: "",
    center_code: "",
    description: "",
    address: "",
    pincode: "",
    phone_number: "",
    alternate_phone: "",
    email: "",
    contact_person: "",
    contact_designation: "",
    google_maps_link: "",
    latitude: undefined,
    longitude: undefined,
    active_years: [],
    is_confirmed_current_year: false,
    status: "active",
    facilities: "",
    instructions: "",
    nearest_railway: "",
    nearest_bus_stand: "",
    landmarks: "",
    capacity: undefined,
  });

  const [yearInput, setYearInput] = useState<string>("");

  const availableCities = useMemo(() => {
    if (!formData.state) return [];
    return CITIES_BY_STATE[formData.state as IndianState] || [];
  }, [formData.state]);

  // Initialize after hydration
  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
    setIsMobileState(mediaQuery);
    if (centerId) {
      loadCenter();
    }
  }, [centerId, mediaQuery]);

  const loadCenter = async () => {
    try {
      const { data, error } = await supabase
        .from("exam_centers")
        .select("*")
        .eq("id", centerId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          exam_type: data.exam_type,
          state: data.state,
          city: data.city,
          center_name: data.center_name,
          center_code: data.center_code || "",
          description: data.description || "",
          address: data.address,
          pincode: data.pincode || "",
          phone_number: data.phone_number || "",
          alternate_phone: data.alternate_phone || "",
          email: data.email || "",
          contact_person: data.contact_person || "",
          contact_designation: data.contact_designation || "",
          google_maps_link: data.google_maps_link || "",
          latitude: data.latitude || undefined,
          longitude: data.longitude || undefined,
          active_years: data.active_years || [],
          is_confirmed_current_year: data.is_confirmed_current_year,
          status: data.status,
          facilities: data.facilities || "",
          instructions: data.instructions || "",
          nearest_railway: data.nearest_railway || "",
          nearest_bus_stand: data.nearest_bus_stand || "",
          landmarks: data.landmarks || "",
          capacity: data.capacity || undefined,
        });
      }
    } catch (err) {
      console.error("Error loading center:", err);
      setError("Failed to load exam center");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ExamCenterInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "state") {
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleAddYear = () => {
    const year = parseInt(yearInput);
    if (!isNaN(year) && year >= 2000 && year <= 2100) {
      if (!formData.active_years.includes(year)) {
        setFormData((prev) => ({
          ...prev,
          active_years: [...prev.active_years, year].sort((a, b) => b - a),
        }));
      }
      setYearInput("");
    }
  };

  const handleRemoveYear = (year: number) => {
    setFormData((prev) => ({
      ...prev,
      active_years: prev.active_years.filter((y) => y !== year),
    }));
  };

  const quickAddYears = () => {
    const years = [currentYear, currentYear - 1, currentYear - 2];
    setFormData((prev) => ({
      ...prev,
      active_years: [...new Set([...prev.active_years, ...years])].sort(
        (a, b) => b - a
      ),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.exam_type && formData.center_name);
      case 1:
        return !!(formData.state && formData.city && formData.address);
      case 2:
        return true; // Contact is optional
      case 3:
        return true; // Year tracking is optional
      case 4:
        return true; // Additional info is optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
      setError(null);
    } else {
      setError("Please fill in all required fields in this section");
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      setError("Please fill in all required fields");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        center_code: formData.center_code || null,
        description: formData.description || null,
        pincode: formData.pincode || null,
        phone_number: formData.phone_number || null,
        alternate_phone: formData.alternate_phone || null,
        email: formData.email || null,
        contact_person: formData.contact_person || null,
        contact_designation: formData.contact_designation || null,
        google_maps_link: formData.google_maps_link || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        facilities: formData.facilities || null,
        instructions: formData.instructions || null,
        nearest_railway: formData.nearest_railway || null,
        nearest_bus_stand: formData.nearest_bus_stand || null,
        landmarks: formData.landmarks || null,
        capacity: formData.capacity || null,
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("exam_centers")
          .update(submitData)
          .eq("id", centerId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("exam_centers")
          .insert(submitData);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/exam-centers");
      }, 1500);
    } catch (err: any) {
      console.error("Error saving center:", err);
      setError(err.message || "Failed to save exam center");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} />
          <Typography color="text.secondary">Loading exam center...</Typography>
        </Stack>
      </Box>
    );
  }

  // Don't render until hydration is complete to avoid hydration mismatch
  if (!mounted || currentYear === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} />
          <Typography color="text.secondary">Loading...</Typography>
        </Stack>
      </Box>
    );
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Exam Type</InputLabel>
                <Select
                  value={formData.exam_type}
                  onChange={(e) => handleChange("exam_type", e.target.value)}
                  label="Exam Type"
                >
                  {EXAM_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Center Code"
                value={formData.center_code}
                onChange={(e) => handleChange("center_code", e.target.value)}
                placeholder="e.g., TN001"
                helperText="Optional unique identifier"
              />
            </Stack>
            <TextField
              fullWidth
              required
              label="Center Name"
              value={formData.center_name}
              onChange={(e) => handleChange("center_name", e.target.value)}
              placeholder="e.g., Anna University - CEG Campus"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description about the exam center..."
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  label="Status"
                >
                  {CENTER_STATUS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="Seating Capacity"
                value={formData.capacity || ""}
                onChange={(e) =>
                  handleChange(
                    "capacity",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="e.g., 200"
              />
            </Stack>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>State</InputLabel>
                <Select
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  label="State"
                >
                  {INDIAN_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                value={formData.city}
                onChange={(e, newValue) => handleChange("city", newValue || "")}
                options={availableCities}
                freeSolo
                disabled={!formData.state}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="City"
                    placeholder="Select or type city name"
                    helperText={!formData.state ? "Select state first" : ""}
                  />
                )}
              />
            </Stack>
            <TextField
              fullWidth
              required
              multiline
              rows={2}
              label="Address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Full address of the exam center..."
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
                placeholder="e.g., 600025"
                inputProps={{ maxLength: 6 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Latitude"
                value={formData.latitude || ""}
                onChange={(e) =>
                  handleChange(
                    "latitude",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="e.g., 13.0827"
              />
              <TextField
                fullWidth
                type="number"
                label="Longitude"
                value={formData.longitude || ""}
                onChange={(e) =>
                  handleChange(
                    "longitude",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="e.g., 80.2707"
              />
            </Stack>
            <TextField
              fullWidth
              label="Google Maps Link"
              value={formData.google_maps_link}
              onChange={(e) => handleChange("google_maps_link", e.target.value)}
              placeholder="https://maps.google.com/..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Landmarks"
              value={formData.landmarks}
              onChange={(e) => handleChange("landmarks", e.target.value)}
              placeholder="Notable landmarks near the center..."
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Nearest Railway Station"
                value={formData.nearest_railway}
                onChange={(e) =>
                  handleChange("nearest_railway", e.target.value)
                }
                placeholder="e.g., Guindy Railway Station"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrainIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Nearest Bus Stand"
                value={formData.nearest_bus_stand}
                onChange={(e) =>
                  handleChange("nearest_bus_stand", e.target.value)
                }
                placeholder="e.g., Guindy Bus Terminus"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DirectionsBusIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contact_person}
                onChange={(e) => handleChange("contact_person", e.target.value)}
                placeholder="e.g., Prof. Kumar"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Designation"
                value={formData.contact_designation}
                onChange={(e) =>
                  handleChange("contact_designation", e.target.value)
                }
                placeholder="e.g., Exam Coordinator"
              />
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                type="tel"
                label="Phone Number"
                value={formData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                placeholder="e.g., 044-22357890"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type="tel"
                label="Alternate Phone"
                value={formData.alternate_phone}
                onChange={(e) =>
                  handleChange("alternate_phone", e.target.value)
                }
                placeholder="Secondary contact number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="exam@institution.edu"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Years this center was used
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                {formData.active_years.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No years added yet
                  </Typography>
                ) : (
                  formData.active_years.map((year) => (
                    <Chip
                      key={year}
                      label={year}
                      onDelete={() => handleRemoveYear(year)}
                      color={year === currentYear ? "success" : "default"}
                      variant={year === currentYear ? "filled" : "outlined"}
                    />
                  ))
                )}
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <TextField
                  type="number"
                  size="small"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  placeholder="Enter year"
                  inputProps={{ min: 2000, max: 2100 }}
                  sx={{ width: 140 }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddYear())
                  }
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddYear}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={quickAddYears}
                  color="primary"
                >
                  Add Last 3 Years
                </Button>
              </Stack>
            </Box>
            <Card variant="outlined" sx={{ bgcolor: "success.lighter" }}>
              <CardContent>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_confirmed_current_year}
                      onChange={(e) =>
                        handleChange(
                          "is_confirmed_current_year",
                          e.target.checked
                        )
                      }
                      color="success"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      Confirmed as exam center for {currentYear}
                    </Typography>
                  }
                />
              </CardContent>
            </Card>
          </Stack>
        );

      case 4:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Facilities"
              value={formData.facilities}
              onChange={(e) => handleChange("facilities", e.target.value)}
              placeholder="e.g., Parking available, AC halls, Wheelchair accessible..."
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Instructions for Students"
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
              placeholder="Special instructions for students appearing at this center..."
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 0,
        }}
      >
        <Box sx={{ maxWidth: "lg", mx: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <IconButton
              component={Link}
              href="/exam-centers"
              sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)" }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold">
                {isEditing ? "Edit Exam Center" : "Add Exam Center"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {isEditing
                  ? "Update exam center information"
                  : "Add a new NATA or JEE exam center"}
              </Typography>
            </Box>
          </Stack>

          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ color: "rgba(255,255,255,0.8)" }}
          >
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <HomeIcon fontSize="small" />
                <Typography variant="body2">Home</Typography>
              </Stack>
            </Link>
            <Link
              href="/exam-centers"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Typography variant="body2">Exam Centers</Typography>
            </Link>
            <Typography variant="body2" sx={{ color: "white" }}>
              {isEditing ? "Edit" : "New"}
            </Typography>
          </Breadcrumbs>
        </Box>
      </Paper>

      {/* Success Message */}
      <Fade in={success}>
        <Box sx={{ maxWidth: "lg", mx: "auto", px: { xs: 2, sm: 3 }, pt: 3 }}>
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ borderRadius: 2 }}
          >
            Exam center {isEditing ? "updated" : "created"} successfully!
            Redirecting...
          </Alert>
        </Box>
      </Fade>

      {/* Error Message */}
      <Fade in={!!error}>
        <Box sx={{ maxWidth: "lg", mx: "auto", px: { xs: 2, sm: 3 }, pt: 3 }}>
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{ borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Box>
      </Fade>

      {/* Form */}
      <Box sx={{ maxWidth: "lg", mx: "auto", px: { xs: 2, sm: 3 }, pt: 3 }}>
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
          {/* Stepper */}
          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "grey.50" }}>
            <Stepper
              activeStep={activeStep}
              orientation={isMobile ? "vertical" : "horizontal"}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    optional={
                      index > 1 && (
                        <Typography variant="caption">Optional</Typography>
                      )
                    }
                  >
                    {isMobile ? label : label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Divider />

          {/* Step Content */}
          <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: 400 }}>
            <Zoom in={true} key={activeStep}>
              <Box>{renderStepContent(activeStep)}</Box>
            </Zoom>
          </Box>

          <Divider />

          {/* Navigation Buttons */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: "flex",
              justifyContent: "space-between",
              bgcolor: "grey.50",
            }}
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<NavigateBeforeIcon />}
              variant="outlined"
            >
              Back
            </Button>
            <Box sx={{ flex: 1 }} />
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving || success}
                startIcon={
                  saving ? <CircularProgress size={16} /> : <SaveIcon />
                }
                size="large"
              >
                {saving
                  ? "Saving..."
                  : isEditing
                  ? "Update Center"
                  : "Create Center"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NavigateNextIcon />}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
