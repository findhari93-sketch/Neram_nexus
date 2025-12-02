"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, UsersDuplicateRow } from "@/lib/supabaseClient";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Skeleton,
  Link as MuiLink,
  TextField,
  Snackbar,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
} from "@mui/material";
import { useSession } from "next-auth/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import SchoolIcon from "@mui/icons-material/School";
import PaymentIcon from "@mui/icons-material/Payment";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import mrtTheme from "../../mrtTheme";

// Import normalization utilities (we'll create a shared file)
type RawRow = Record<string, any>;

interface NormalizedClassRequest extends Record<string, unknown> {
  id?: number;
  photo_url?: string | null;
  student_name?: string | null;
  display_name?: string | null;
  name?: string | null;
  providers?: unknown;
  contact?: unknown;
  created_at?: string | null;
  last_sign_in?: string | null;
  account_type?: string;
  firebase_uid?: string;
  phone_auth_used?: boolean;
  role?: string;
  city?: string;
  email?: string;
  phone?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  father_name?: string;
  gender?: string;
  dob?: string;
  application_submitted?: boolean;
  app_submitted_date_time?: string;
  application_admin_approval?: unknown;
  approved_at?: string;
  approved_by?: unknown;
  email_status?: string;
  email_sent_at?: string;
  final_course_Name?: string;
  course_duration?: string;
  payment_options?: string;
  total_course_fees?: unknown;
  first_installment_amount?: unknown;
  second_installment_amount?: unknown;
  second_installment_date?: string;
  final_fee_payment_amount?: unknown;
  remaining_fees?: unknown;
  discount?: unknown;
  will_study_next_year?: string;
  nata_attempt_year?: string;
  offer_before_date?: string;
  admin_comment?: string;
  payment_status?: string;
  payment_method?: string;
  payment_at?: string;
  payment_id?: string;
  order_id?: string;
  amount?: unknown;
  currency?: string;
  upi_id?: string;
  bank?: string;
  receipt?: string;
  verified?: string | boolean;
  signature?: string;
  installment_type?: string;
  token_used?: boolean;
  discount_full?: unknown;
  last_verify_at?: string;
  order_created_at?: string;
  token_expires?: string;
  installment1_amount?: unknown;
  installment2_amount?: unknown;
  payment_history?: Array<{
    ts?: string;
    event?: string;
    amount?: number;
    source?: string;
    orderId?: string;
    paymentId?: string;
  }>;
}

// Avatar component
const AvatarWithFallback: React.FC<{
  src?: string | null;
  name?: string | null;
  size?: number;
  onClick?: () => void;
}> = ({ src, name, size = 120, onClick }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((s: string) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : undefined;

  let finalSrc = src ?? undefined;
  if (
    finalSrc &&
    typeof finalSrc === "string" &&
    finalSrc.startsWith("http://")
  ) {
    finalSrc = finalSrc.replace(/^http:\/\//i, "https://");
  }

  const hashString = (str?: string | null) => {
    if (!str) return 0;
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  };

  const palette = [
    "#60a5fa",
    "#f472b6",
    "#f97316",
    "#34d399",
    "#a78bfa",
    "#06b6d4",
    "#fb7185",
    "#f59e0b",
  ];
  const idx = hashString(name) % palette.length;
  const color1 = palette[idx];
  const color2 =
    palette[(idx + Math.floor(palette.length / 2)) % palette.length];

  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    const bigint = parseInt(
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h,
      16
    );
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  };

  const luminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const srgb = [r, g, b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };

  const avgL = (luminance(color1) + luminance(color2)) / 2;
  const textColor = avgL > 0.5 ? "#000000" : "#ffffff";

  return (
    <Box
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 600,
        color: textColor,
        cursor: onClick ? "pointer" : "default",
        backgroundImage:
          !finalSrc || imgFailed
            ? `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
            : "none",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {!imgFailed && finalSrc ? (
        <img
          src={finalSrc}
          alt={name ?? "User"}
          onError={() => setImgFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span>{initials ?? "?"}</span>
      )}
    </Box>
  );
};

// Label-Value component
const LabelValue: React.FC<{
  label: string;
  value?: React.ReactNode;
  type?: "text" | "email" | "phone" | "date" | "currency" | "badge";
  badgeColor?: "success" | "error" | "warning" | "info" | "default";
}> = ({ label, value, type = "text", badgeColor = "default" }) => {
  const formatValue = () => {
    if (React.isValidElement(value)) return value;
    if (value === null || value === undefined || value === "") return "—";

    switch (type) {
      case "date": {
        const v = value as any;
        const d = new Date(v);
        return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
      }
      case "currency": {
        const n =
          typeof value === "number"
            ? value
            : typeof value === "string"
            ? parseFloat(value)
            : NaN;
        if (!isFinite(n)) return "—";
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(n);
      }
      case "email":
        return (
          <MuiLink href={`mailto:${value}`} sx={{ color: "primary.main" }}>
            {String(value)}
          </MuiLink>
        );
      case "phone":
        return (
          <MuiLink href={`tel:${value}`} sx={{ color: "primary.main" }}>
            {String(value)}
          </MuiLink>
        );
      case "badge":
        return (
          <Chip
            label={String(value)}
            color={badgeColor}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
      default:
        return String(value);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 600,
          display: "block",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" component="div">
        {formatValue()}
      </Typography>
    </Box>
  );
};

// Info Card component
const InfoCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "box-shadow 0.3s",
        "&:hover": {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box sx={{ color: "primary.main", mr: 1 }}>{icon}</Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

// Admin Filled Card Component
const AdminFilledCard: React.FC<{
  user: NormalizedClassRequest;
  canEdit: boolean;
  handleApproval: (status: "Approved" | "Rejected") => Promise<void>;
  isApproving: boolean;
  session: any;
  userId: string;
  queryClient: any;
  setSnack: (snack: {
    open: boolean;
    severity: "success" | "error";
    msg: string;
  }) => void;
}> = ({
  user,
  canEdit,
  handleApproval,
  isApproving,
  session,
  userId,
  queryClient,
  setSnack,
}) => {
  // Get admin object from user data
  const adminObj = user || {};

  // Academic years list (starting current year, then next few)
  const now = new Date();
  const currentYear = now.getFullYear();
  const getAcademicYears = (count = 6) => {
    const yrs = [];
    for (let i = 0; i < count; i++) {
      const start = currentYear + i;
      yrs.push(`${start}-${String(start + 1).slice(2)}`);
    }
    return yrs;
  };
  const years = getAcademicYears(6);

  // Form state for admin-editable fields
  const [finalCourse, setFinalCourse] = React.useState(
    adminObj.final_course_Name || ""
  );

  const normWill = (v: any) => {
    if (v === true) return "yes";
    if (v === false) return "no";
    if (!v) return "maybe";
    return String(v).toLowerCase();
  };
  const [willStudyNextYear, setWillStudyNextYear] = React.useState(
    adminObj.will_study_next_year !== undefined
      ? normWill(adminObj.will_study_next_year)
      : "maybe"
  );

  const [courseDuration, setCourseDuration] = React.useState(
    adminObj.course_duration || ""
  );
  const [adminComment, setAdminComment] = React.useState(
    adminObj.admin_comment ?? ""
  );

  // Helper function to convert ISO date to yyyy-MM-dd format for date inputs
  const toDateInputFormat = (isoString: any) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      // Format as yyyy-MM-dd
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  // Installment/payment UI state
  const [firstInstallmentAmount, setFirstInstallmentAmount] = React.useState(
    adminObj.first_installment_amount ?? ""
  );
  const [secondInstallmentDate, setSecondInstallmentDate] = React.useState(
    toDateInputFormat(adminObj.second_installment_date)
  );
  const [offerPayBeforeDate, setOfferPayBeforeDate] = React.useState(
    toDateInputFormat(adminObj.offer_before_date)
  );
  const [totalCourseFees, setTotalCourseFees] = React.useState(
    adminObj.total_course_fees ?? ""
  );
  const [discount, setDiscount] = React.useState(adminObj.discount ?? "");
  const [paymentOptions, setPaymentOptions] = React.useState(() => {
    const p = adminObj.payment_options || null;
    if (Array.isArray(p) && p.length > 0) return p.map((x: any) => String(x));
    if (typeof p === "string" && p) return [String(p)];
    return ["Partial"];
  });

  const isFullSelected = paymentOptions.includes("Full");

  const toNum = (v: any) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const [yearIndex, setYearIndex] = React.useState(() => {
    const cur = adminObj.nata_attempt_year
      ? years.indexOf(adminObj.nata_attempt_year)
      : 0;
    return cur >= 0 ? cur : 0;
  });

  const [saving, setSaving] = React.useState(false);

  const saveAdminFilled = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const safeNumber = (v: any) => {
        if (v === null || v === undefined || v === "") return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };

      const computedRemaining =
        safeNumber(totalCourseFees)! -
        safeNumber(discount)! -
        safeNumber(firstInstallmentAmount)!;

      // Basic validation when partial payments are expected
      if (!isFullSelected) {
        if (!firstInstallmentAmount || Number(firstInstallmentAmount) <= 0) {
          throw new Error("Please provide a valid 1st installment amount");
        }
        if (computedRemaining < 0) {
          throw new Error("Computed remaining fees must be >= 0");
        }
        if (!secondInstallmentDate) {
          throw new Error("Please pick a 2nd installment date");
        }
      }

      const rowId = (user as any).id ?? userId;
      const current = await supabase
        .from("users_duplicate")
        .select("admin_filled, application_details")
        .eq("id", rowId)
        .limit(1)
        .maybeSingle();

      if (current.error) throw new Error(current.error.message);
      if (!current.data) throw new Error("User not found for update");

      const existing =
        typeof current.data.application_details === "string"
          ? JSON.parse(current.data.application_details || "{}")
          : current.data.application_details || {};
      const existingAdmin =
        typeof current.data.admin_filled === "string"
          ? JSON.parse(current.data.admin_filled || "{}")
          : current.data.admin_filled || {};

      const paymentOptStr = paymentOptions?.[0]
        ? String(paymentOptions[0]).toLowerCase()
        : "partial";

      const nataYear = years[yearIndex] || null;

      // Normalize dates to ISO string when provided
      const secondInstallmentIso =
        secondInstallmentDate && String(secondInstallmentDate).trim()
          ? (() => {
              try {
                const d = new Date(secondInstallmentDate);
                if (!isNaN(d.getTime())) return d.toISOString();
              } catch (e) {
                // fallthrough
              }
              return String(secondInstallmentDate);
            })()
          : null;

      const offerPayBeforeIso =
        offerPayBeforeDate && String(offerPayBeforeDate).trim()
          ? (() => {
              try {
                const d = new Date(offerPayBeforeDate);
                if (!isNaN(d.getTime())) return d.toISOString();
              } catch (e) {
                // fallthrough
              }
              return String(offerPayBeforeDate);
            })()
          : null;

      // Compute final fee payment amount
      const finalComputedRaw = isFullSelected
        ? (safeNumber(totalCourseFees) ?? 0) - (safeNumber(discount) ?? 0)
        : (safeNumber(firstInstallmentAmount) ?? 0) -
          (safeNumber(discount) ?? 0);
      const finalComputed = Number.isFinite(finalComputedRaw)
        ? Math.max(0, finalComputedRaw)
        : null;

      const adminPayload = {
        final_course_Name: finalCourse ?? "",
        nata_attempt_year: nataYear,
        will_study_next_year: willStudyNextYear ?? "maybe",
        course_duration: courseDuration ?? "",
        admin_comment: adminComment ?? "",
        ready_for_full_payment: Boolean(isFullSelected),
        payment_options: paymentOptStr,
        first_installment_amount: isFullSelected
          ? null
          : safeNumber(firstInstallmentAmount),
        installment1_amount: isFullSelected
          ? null
          : safeNumber(firstInstallmentAmount),
        second_installment_amount: isFullSelected
          ? null
          : safeNumber(computedRemaining),
        remaining_fees: isFullSelected ? null : safeNumber(computedRemaining),
        second_installment_date: isFullSelected ? null : secondInstallmentIso,
        offer_before_date: isFullSelected ? null : offerPayBeforeIso,
        final_fee_payment_amount: finalComputed,
        total_course_fees:
          totalCourseFees !== "" &&
          totalCourseFees !== null &&
          totalCourseFees !== undefined
            ? safeNumber(totalCourseFees)
            : null,
        discount:
          discount !== "" && discount !== null && discount !== undefined
            ? safeNumber(discount)
            : null,
      };

      const mergedAdmin = {
        ...existingAdmin,
        ...adminPayload,
      };
      const mergedApplicationDetails = {
        ...existing,
        admin_filled: mergedAdmin,
        admin_filled_details: mergedAdmin,
      };

      const { error: updErr } = await supabase
        .from("users_duplicate")
        .update({
          application_details: mergedApplicationDetails,
          admin_filled: mergedAdmin,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rowId);

      if (updErr) throw new Error(updErr.message);

      await queryClient.invalidateQueries({ queryKey: ["user", userId] });

      setSnack({
        open: true,
        severity: "success",
        msg: "Saved admin details",
      });
    } catch (err: any) {
      setSnack({
        open: true,
        severity: "error",
        msg: `Save failed: ${err.message || err}`,
      });
    } finally {
      setSaving(false);
    }
  };

  // Check if application is already processed
  const isApproved = adminObj.application_admin_approval === "Approved";
  const isRejected = adminObj.application_admin_approval === "Rejected";
  const isProcessed = isApproved || isRejected;

  return (
    <Box
      sx={{
        width: { xs: "100%", lg: "400px" },
      }}
    >
      <Card>
        <CardContent sx={{ flex: 1, overflow: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box sx={{ color: "primary.main", mr: 1 }}>
              <SchoolIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              Admin Filled Details
            </Typography>
          </Box>

          {/* Show approval status if already processed */}
          {isProcessed && (
            <Alert
              severity={isApproved ? "success" : "error"}
              sx={{ mb: 3 }}
              icon={isApproved ? <SchoolIcon /> : undefined}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Application {isApproved ? "Approved" : "Rejected"}
              </Typography>
              {Boolean(adminObj.approved_by) && (
                <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                  By: {String(adminObj.approved_by)}
                </Typography>
              )}
              {Boolean(adminObj.approved_at) && (
                <Typography variant="caption" sx={{ display: "block" }}>
                  {new Date(String(adminObj.approved_at)).toLocaleString()}
                </Typography>
              )}
            </Alert>
          )}

          {canEdit && (
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handleApproval("Approved")}
                disabled={isApproving || isApproved}
                fullWidth
              >
                {isApproved ? "Already Approved" : "Approve"}
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => handleApproval("Rejected")}
                disabled={isApproving || isApproved}
                fullWidth
              >
                Reject
              </Button>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Joining Course */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
              >
                Joining Course <span style={{ color: "red" }}>*</span> :
              </Typography>
              <Select
                size="small"
                value={finalCourse}
                onChange={(e) => setFinalCourse(e.target.value)}
                disabled={isApproved}
                sx={{ flex: 1 }}
              >
                <MenuItem value="NATA/JEE2 Year Long">
                  NATA/JEE2 Year Long
                </MenuItem>
                <MenuItem value="NATA/JEE2 Crash Course">
                  NATA Crash Course
                </MenuItem>
                <MenuItem value="Software">Software</MenuItem>
              </Select>
            </Box>

            {/* Course Duration */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
              >
                Course Duration <span style={{ color: "red" }}>*</span> :
              </Typography>
              <Select
                size="small"
                value={courseDuration}
                onChange={(e) => setCourseDuration(e.target.value)}
                disabled={isApproved}
                sx={{ flex: 1 }}
              >
                <MenuItem value="1 Year">1 Year</MenuItem>
                <MenuItem value="2 Year">2 Year</MenuItem>
                <MenuItem value="Less than 1 Year">Less than 1 Year</MenuItem>
                <MenuItem value="More">More</MenuItem>
              </Select>
            </Box>

            {/* NATA Exam Year */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
              >
                NATA Exam Year :
              </Typography>
              <Select
                size="small"
                value={years[yearIndex]}
                onChange={(e) => {
                  const v = e.target.value;
                  const idx = years.indexOf(v);
                  if (idx >= 0) setYearIndex(idx);
                }}
                disabled={isApproved}
                sx={{ flex: 1 }}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* Payment Options */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
              >
                Payment Options <span style={{ color: "red" }}>*</span> :
              </Typography>
              <RadioGroup
                row
                value={paymentOptions?.[0] ?? "Partial"}
                onChange={(e) => setPaymentOptions([e.target.value])}
                sx={{ flex: 1 }}
              >
                <FormControlLabel
                  value="Full"
                  control={<Radio size="small" />}
                  label="Full"
                  disabled={isApproved}
                />
                <FormControlLabel
                  value="Partial"
                  control={<Radio size="small" />}
                  label="Partial"
                  disabled={isApproved}
                />
              </RadioGroup>
            </Box>

            {/* Total course fees */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
              >
                Total course fees :
              </Typography>
              <TextField
                size="small"
                type="number"
                value={totalCourseFees ?? ""}
                onChange={(e) => setTotalCourseFees(e.target.value)}
                disabled={isApproved}
                inputProps={{ min: 0 }}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Discount */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
              >
                Discount :
              </Typography>
              <TextField
                size="small"
                type="number"
                value={discount ?? ""}
                onChange={(e) => setDiscount(e.target.value)}
                disabled={isApproved}
                inputProps={{ min: 0 }}
                sx={{ flex: 1, maxWidth: 200 }}
              />
            </Box>

            {/* 1st installment - hide when Full payment option selected */}
            {!isFullSelected && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
                >
                  1st installment :
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={firstInstallmentAmount ?? ""}
                  onChange={(e) => setFirstInstallmentAmount(e.target.value)}
                  disabled={isApproved}
                  inputProps={{ min: 0 }}
                  sx={{ flex: 1 }}
                />
              </Box>
            )}

            {/* Offer Pay Before + 2nd installment fields: hide when Full is selected */}
            {!isFullSelected && (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
                  >
                    Offer Pay Before :
                  </Typography>
                  <TextField
                    size="small"
                    type="date"
                    value={offerPayBeforeDate ?? ""}
                    onChange={(e) => setOfferPayBeforeDate(e.target.value)}
                    disabled={isApproved}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                </Box>

                {/* 2nd installment (Remaining fees) - computed */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
                  >
                    2nd installment :
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={
                      toNum(totalCourseFees) -
                        toNum(discount) -
                        toNum(firstInstallmentAmount) || ""
                    }
                    disabled
                    inputProps={{ min: 0 }}
                    sx={{ flex: 1 }}
                  />
                </Box>

                {/* 2nd installment Date */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
                  >
                    2nd installment Date :
                  </Typography>
                  <TextField
                    size="small"
                    type="date"
                    value={secondInstallmentDate ?? ""}
                    onChange={(e) => setSecondInstallmentDate(e.target.value)}
                    disabled={isApproved}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </>
            )}

            {/* Final fee payment amount (autofilled) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
              >
                Final fee payment amount :
              </Typography>
              <TextField
                size="small"
                type="number"
                value={Math.max(
                  0,
                  (isFullSelected
                    ? toNum(totalCourseFees) - toNum(discount)
                    : toNum(firstInstallmentAmount) - toNum(discount)) || 0
                )}
                disabled
                inputProps={{ min: 0 }}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Will study next year */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ minWidth: 140, textAlign: "right", fontWeight: 500 }}
              >
                Will study next year :
              </Typography>
              <RadioGroup
                row
                value={willStudyNextYear}
                onChange={(e) => setWillStudyNextYear(e.target.value)}
                sx={{ flex: 1 }}
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio size="small" />}
                  label="Yes"
                  disabled={isApproved}
                />
                <FormControlLabel
                  value="no"
                  control={<Radio size="small" />}
                  label="No"
                  disabled={isApproved}
                />
                <FormControlLabel
                  value="maybe"
                  control={<Radio size="small" />}
                  label="Maybe"
                  disabled={isApproved}
                />
              </RadioGroup>
            </Box>

            {/* Admin comment */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  minWidth: 140,
                  textAlign: "right",
                  fontWeight: 500,
                  pt: 1,
                }}
              >
                Admin comment :
              </Typography>
              <TextField
                size="small"
                multiline
                rows={3}
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                disabled={isApproved}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Action buttons */}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                onClick={() => {
                  // Reset to original values
                  setFinalCourse(
                    adminObj.final_course_Name || "NATA/JEE2 Year Long"
                  );
                  setWillStudyNextYear(
                    normWill(adminObj.will_study_next_year) || "maybe"
                  );
                  setCourseDuration(adminObj.course_duration || "");

                  let resetPaymentOpts: string[];
                  if (typeof adminObj.payment_options === "string") {
                    const p = adminObj.payment_options;
                    resetPaymentOpts = [
                      String(p).charAt(0).toUpperCase() + String(p).slice(1),
                    ];
                  } else if (Array.isArray(adminObj.payment_options)) {
                    resetPaymentOpts = (adminObj.payment_options as any[]).map(
                      (p: any) =>
                        String(p).charAt(0).toUpperCase() + String(p).slice(1)
                    );
                  } else {
                    resetPaymentOpts = ["Partial"];
                  }
                  setPaymentOptions(resetPaymentOpts);
                  const resetIsFull = resetPaymentOpts.includes("Full");
                  setFirstInstallmentAmount(
                    resetIsFull ? "" : adminObj.first_installment_amount ?? ""
                  );
                  setSecondInstallmentDate(
                    resetIsFull
                      ? ""
                      : toDateInputFormat(adminObj.second_installment_date)
                  );
                  setOfferPayBeforeDate(
                    resetIsFull
                      ? ""
                      : toDateInputFormat(adminObj.offer_before_date)
                  );
                  setTotalCourseFees(adminObj.total_course_fees ?? "");
                  setDiscount(adminObj.discount ?? "");
                  setAdminComment(adminObj.admin_comment ?? "");
                  const idx = adminObj.nata_attempt_year
                    ? years.indexOf(adminObj.nata_attempt_year)
                    : 0;
                  setYearIndex(idx >= 0 ? idx : 0);
                }}
                disabled={saving || isApproved}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={saveAdminFilled}
                disabled={saving || isApproved}
              >
                {saving ? "Saving..." : isApproved ? "Locked (Approved)" : "Save"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// Normalization helper (simplified from WebUsersGrid)
function normalizeClassRequest(raw: RawRow): NormalizedClassRequest {
  const out: any = { ...raw };
  out.id = raw.id;

  // Parse account JSONB
  const account =
    typeof raw.account === "string"
      ? JSON.parse(raw.account || "{}")
      : raw.account || {};
  out.photo_url = account.photo_url || account.photoUrl || account.avatar;
  out.firebase_uid = account.firebase_uid || account.uid;
  out.account_type = account.account_type || account.type;
  out.providers = account.providers || account.provider;
  out.created_at = account.created_at || account.createdAt;
  out.phone_auth_used =
    account.phone_auth_used || account.phone_verified || false;

  // Parse basic JSONB
  const basic =
    typeof raw.basic === "string"
      ? JSON.parse(raw.basic || "{}")
      : raw.basic || {};
  out.student_name =
    basic.student_name || basic.studentName || basic.name || basic.full_name;
  out.father_name = basic.father_name || basic.fatherName;
  out.gender = basic.gender || basic.sex;
  out.dob = basic.dob || basic.date_of_birth;

  // Parse contact JSONB
  const contact =
    typeof raw.contact === "string"
      ? JSON.parse(raw.contact || "{}")
      : raw.contact || {};
  out.email = contact.email || contact.primary_email;
  out.phone = contact.phone || contact.mobile;
  out.city = contact.city;
  out.state = contact.state;
  out.country = contact.country;
  out.zip_code = contact.zip_code || contact.zip;
  out.contact = contact;

  // Parse application_details JSONB
  const app =
    typeof raw.application_details === "string"
      ? JSON.parse(raw.application_details || "{}")
      : raw.application_details || {};
  out.application_submitted = app.application_submitted || app.submitted;
  out.app_submitted_date_time = app.app_submitted_date_time || app.submitted_at;
  out.application_admin_approval = app.application_admin_approval;
  out.approved_at = app.approved_at;
  out.approved_by = app.approved_by;
  out.email_status = app.email_status;
  out.email_sent_at = app.email_sent_at;

  // Parse admin_filled JSONB
  const admin =
    typeof raw.admin_filled === "string"
      ? JSON.parse(raw.admin_filled || "{}")
      : raw.admin_filled || {};
  out.final_course_Name = admin.final_course_Name || admin.finalCourseName;
  out.course_duration = admin.course_duration;
  out.payment_options = admin.payment_options;
  out.total_course_fees = admin.total_course_fees;
  out.first_installment_amount = admin.first_installment_amount;
  out.second_installment_amount = admin.second_installment_amount;
  out.second_installment_date = admin.second_installment_date;
  out.final_fee_payment_amount = admin.final_fee_payment_amount;
  out.remaining_fees = admin.remaining_fees;
  out.discount = admin.discount;
  out.will_study_next_year = admin.will_study_next_year;
  out.nata_attempt_year = admin.nata_attempt_year;
  out.offer_before_date = admin.offer_before_date;
  out.admin_comment = admin.admin_comment;

  // Parse final_fee_payment JSONB
  const payment =
    typeof raw.final_fee_payment === "string"
      ? JSON.parse(raw.final_fee_payment || "{}")
      : raw.final_fee_payment || {};
  out.payment_status = payment.payment_status;
  out.payment_method = payment.payment_method;
  out.payment_at = payment.payment_at;
  out.payment_id = payment.payment_id || payment.razorpay_payment_id;
  out.order_id = payment.order_id || payment.razorpay_order_id;
  out.amount = payment.amount || payment.payable_amount;
  out.currency = payment.currency;
  out.upi_id = payment.upi_id;
  out.bank = payment.bank;
  out.receipt = payment.receipt;
  out.verified = payment.verified;
  out.signature = payment.signature;
  out.installment_type = payment.installment_type;

  // Additional payment fields
  out.token_used = payment.token_used;
  out.discount_full = payment.discount_full;
  out.last_verify_at = payment.last_verify_at;
  out.order_created_at = payment.order_created_at;
  out.token_expires = payment.token_expires;
  out.installment1_amount = payment.installment1_amount;
  out.installment2_amount = payment.installment2_amount;
  out.payment_history = payment.payment_history;

  return out as NormalizedClassRequest;
}

export default function ClassRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    severity: "success" | "error";
    msg: string;
  }>({ open: false, severity: "success", msg: "" });
  const [isApproving, setIsApproving] = useState(false);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      // Try to fetch by id (uuid) first; if not found, try firebase_uid inside account JSONB
      // Use maybeSingle() to avoid 406 when the server cannot coerce to a single object
      const byId = await supabase
        .from("users_duplicate")
        .select("*")
        .eq("id", userId)
        .limit(1)
        .maybeSingle();

      if (!byId.error && byId.data) {
        return normalizeClassRequest(byId.data as RawRow);
      }

      // Fallback: match by firebase_uid in account JSONB
      const byFirebase = await supabase
        .from("users_duplicate")
        .select("*")
        .filter("account->>firebase_uid", "eq", userId)
        .limit(1)
        .maybeSingle();

      if (byFirebase.error) {
        throw new Error(byFirebase.error.message);
      }
      if (!byFirebase.data) {
        throw new Error("User not found");
      }

      return normalizeClassRequest(byFirebase.data as RawRow);
    },
  });

  // Determine permissions
  const canEdit = useMemo(() => {
    const role = session?.user?.role;
    return role === "admin" || role === "super_admin";
  }, [session?.user?.role]);

  // Handle approval/rejection - calls API endpoint which sends email
  const handleApproval = async (status: "Approved" | "Rejected") => {
    if (!user) return;
    setIsApproving(true);
    try {
      const rowId = (user as any).id ?? userId;

      // Call our API endpoint which handles database update AND email sending
      const response = await fetch("/api/applications/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: rowId,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process approval");
      }

      const result = await response.json();

      // Invalidate query to refresh data
      await queryClient.invalidateQueries({ queryKey: ["user", userId] });

      setSnack({
        open: true,
        severity: "success",
        msg: result.emailSent
          ? `Application ${status.toLowerCase()} successfully and email sent to the user.`
          : `Application ${status.toLowerCase()} successfully.`,
      });
    } catch (err: any) {
      console.error("Approval error:", err);
      setSnack({
        open: true,
        severity: "error",
        msg: err?.message || "Failed to update approval status",
      });
    } finally {
      setIsApproving(false);
    }
  };

  // Get user name for the header (must be before early returns to avoid hook issues)
  const userName = user
    ? user.student_name ||
      user.display_name ||
      user.name ||
      "Class Request Details"
    : "Class Request Details";

  // Set custom title and breadcrumbs for the header - MUST be before any conditional returns
  React.useEffect(() => {
    if (!user) return; // Don't update header if no user data yet

    // We'll use a custom event to communicate with the layout
    const event = new CustomEvent("updatePageHeader", {
      detail: {
        sectionTitle: `Class Join Request Details - ${userName}`,
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Class Join Requests", href: "/class-requests" },
          { label: userName },
        ],
        showBack: true,
        onBack: () => router.push("/class-requests"),
      },
    });
    window.dispatchEvent(event);

    // Cleanup: reset to default when component unmounts
    return () => {
      const resetEvent = new CustomEvent("updatePageHeader", {
        detail: { reset: true },
      });
      window.dispatchEvent(resetEvent);
    };
  }, [user, userName, router]);

  if (isLoading) {
    return (
      <ThemeProvider theme={mrtTheme}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <Skeleton
            variant="rectangular"
            height={40}
            width={200}
            sx={{ mb: 3 }}
          />
          <Skeleton variant="text" height={60} width={300} sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", mx: -1.5, my: -1.5 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Box
                key={i}
                sx={{
                  width: { xs: "100%", md: "50%" },
                  p: 1.5,
                  boxSizing: "border-box",
                }}
              >
                <Skeleton variant="rectangular" height={400} />
              </Box>
            ))}
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (error || !user) {
    return (
      <ThemeProvider theme={mrtTheme}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/class-requests")}
            sx={{ mb: 3 }}
          >
            Back to Class Requests
          </Button>
          <Alert severity="error">
            {error instanceof Error ? error.message : "User not found"}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  const providers = Array.isArray(user.providers)
    ? user.providers
    : typeof user.providers === "string"
    ? [user.providers]
    : [];

  return (
    <ThemeProvider theme={mrtTheme}>
      <CssBaseline />
      <Box sx={{ p: 2, height: "calc(100vh - 150px)" }}>
        {/* Main Layout: Two scrollable columns on left + Fixed full-height admin card on right */}
        <Box sx={{ display: "flex", gap: 3, height: "100%" }}>
          {/* Left side - Two columns of scrollable cards */}

          <Box sx={{ display: "flex", flexWrap: "wrap", mx: -1.5, my: -1.5 }}>
            {/* CARD 1: Basic Information */}
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                p: 1.5,
                boxSizing: "border-box",
              }}
            >
              <InfoCard title="Basic Information" icon={<PersonIcon />}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                  <AvatarWithFallback
                    src={user.photo_url}
                    name={userName}
                    size={120}
                    onClick={() => setAvatarDialogOpen(true)}
                  />
                </Box>
                <LabelValue label="Student Name" value={user.student_name} />
                <LabelValue label="Father Name" value={user.father_name} />
                <LabelValue label="Gender" value={user.gender} />
                <LabelValue
                  label="Date of Birth"
                  value={user.dob}
                  type="date"
                />
              </InfoCard>
            </Box>

            {/* CARD 2: Contact Details */}
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                p: 1.5,
                boxSizing: "border-box",
              }}
            >
              <InfoCard title="Contact Details" icon={<ContactMailIcon />}>
                <LabelValue label="Email" value={user.email} type="email" />
                <LabelValue label="Phone" value={user.phone} type="phone" />
                <LabelValue label="City" value={user.city} />
                <LabelValue label="State" value={user.state} />
                <LabelValue label="Country" value={user.country} />
                <LabelValue label="Zip Code" value={user.zip_code} />
              </InfoCard>
            </Box>

            {/* CARD 3: Account Details */}
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                p: 1.5,
                boxSizing: "border-box",
              }}
            >
              <InfoCard title="Account Details" icon={<AccountCircleIcon />}>
                <LabelValue label="Account Type" value={user.account_type} />
                <LabelValue label="Firebase UID" value={user.firebase_uid} />
                {providers.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Providers
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {providers.map((p: any, idx: number) => (
                        <Chip key={idx} label={String(p)} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
                <LabelValue
                  label="Phone Auth Used"
                  value={user.phone_auth_used ? "Yes" : "No"}
                  type="badge"
                  badgeColor={user.phone_auth_used ? "success" : "default"}
                />
                <LabelValue
                  label="Created At"
                  value={user.created_at}
                  type="date"
                />
                <LabelValue
                  label="Last Sign In"
                  value={user.last_sign_in}
                  type="date"
                />
              </InfoCard>
            </Box>

            {/* CARD 4: Application Details */}
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                p: 1.5,
                boxSizing: "border-box",
              }}
            >
              <InfoCard title="Application Details" icon={<DescriptionIcon />}>
                <LabelValue
                  label="Application Submitted"
                  value={
                    user.application_submitted ? "Submitted" : "Not Submitted"
                  }
                  type="badge"
                  badgeColor={
                    user.application_submitted ? "success" : "warning"
                  }
                />
                <LabelValue
                  label="Submitted Date/Time"
                  value={user.app_submitted_date_time}
                  type="date"
                />
                <LabelValue
                  label="Admin Approval Status"
                  value={String(user.application_admin_approval ?? "")}
                  type="badge"
                  badgeColor={
                    user.application_admin_approval === "Approved"
                      ? "success"
                      : user.application_admin_approval === "Rejected"
                      ? "error"
                      : "warning"
                  }
                />
                <LabelValue
                  label="Approved At"
                  value={user.approved_at}
                  type="date"
                />
                <LabelValue
                  label="Approved By"
                  value={String(user.approved_by ?? "")}
                />
                <LabelValue label="Email Status" value={user.email_status} />
                <LabelValue
                  label="Email Sent At"
                  value={user.email_sent_at}
                  type="date"
                />
              </InfoCard>
            </Box>

            {/* CARD 5: Payment Details */}
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                p: 1.5,
                boxSizing: "border-box",
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  transition: "box-shadow 0.3s",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box sx={{ color: "primary.main", mr: 1 }}>
                      <PaymentIcon />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Payment Details
                    </Typography>
                  </Box>

                  {/* Payment Status Section */}
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      bgcolor:
                        user.payment_status === "paid"
                          ? "success.lighter"
                          : user.payment_status === "failed"
                          ? "error.lighter"
                          : "warning.lighter",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Status
                      </Typography>
                      <Chip
                        label={user.payment_status?.toUpperCase() || "PENDING"}
                        color={
                          user.payment_status === "paid"
                            ? "success"
                            : user.payment_status === "failed"
                            ? "error"
                            : "warning"
                        }
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>

                  {/* Payment Information */}
                  <LabelValue
                    label="Payment Method"
                    value={user.payment_method}
                  />
                  <LabelValue
                    label="Payment Amount"
                    value={user.amount as number}
                    type="currency"
                  />
                  <LabelValue
                    label="Payment Date"
                    value={user.payment_at}
                    type="date"
                  />
                  {user.order_created_at && (
                    <LabelValue
                      label="Order Created At"
                      value={user.order_created_at}
                      type="date"
                    />
                  )}
                  {user.last_verify_at && (
                    <LabelValue
                      label="Last Verified At"
                      value={user.last_verify_at}
                      type="date"
                    />
                  )}

                  {/* Transaction Details */}
                  {(user.payment_id || user.order_id) && (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mt: 3, mb: 2, fontWeight: 600 }}
                      >
                        Transaction Details
                      </Typography>
                      {user.order_id && (
                        <LabelValue label="Order ID" value={user.order_id} />
                      )}
                      {user.payment_id && (
                        <LabelValue
                          label="Payment ID"
                          value={user.payment_id}
                        />
                      )}
                      {user.receipt && (
                        <LabelValue label="Receipt" value={user.receipt} />
                      )}
                    </>
                  )}

                  {/* Verification Status */}
                  {user.verified !== undefined && (
                    <Box sx={{ mt: 2 }}>
                      <LabelValue
                        label="Verified"
                        value={user.verified ? "Yes" : "No"}
                        type="badge"
                        badgeColor={user.verified ? "success" : "warning"}
                      />
                    </Box>
                  )}

                  {/* Payment Method Details */}
                  {(user.upi_id || user.bank) && (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mt: 3, mb: 2, fontWeight: 600 }}
                      >
                        Payment Method Details
                      </Typography>
                      {user.upi_id && (
                        <LabelValue label="UPI ID" value={user.upi_id} />
                      )}
                      {user.bank && (
                        <LabelValue label="Bank" value={user.bank} />
                      )}
                    </>
                  )}

                  {/* Installment Information */}
                  {(user.installment1_amount ||
                    user.installment2_amount ||
                    user.installment_type) && (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ mt: 3, mb: 2, fontWeight: 600 }}
                      >
                        Installment Information
                      </Typography>
                      {user.installment_type && (
                        <LabelValue
                          label="Installment Type"
                          value={user.installment_type}
                        />
                      )}
                      {user.installment1_amount && (
                        <LabelValue
                          label="1st Installment"
                          value={user.installment1_amount as number}
                          type="currency"
                        />
                      )}
                      {user.installment2_amount && (
                        <LabelValue
                          label="2nd Installment"
                          value={user.installment2_amount as number}
                          type="currency"
                        />
                      )}
                    </>
                  )}

                  {/* Payment History */}
                  {user.payment_history &&
                    Array.isArray(user.payment_history) &&
                    user.payment_history.length > 0 && (
                      <>
                        <Typography
                          variant="subtitle2"
                          sx={{ mt: 3, mb: 2, fontWeight: 600 }}
                        >
                          Payment History
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                          {user.payment_history.map((event, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.5,
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.default",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 1,
                                }}
                              >
                                <Chip
                                  label={event.event || "Event"}
                                  size="small"
                                  color={
                                    event.event?.includes("verified") ||
                                    event.event?.includes("success")
                                      ? "success"
                                      : event.event?.includes("failed")
                                      ? "error"
                                      : "info"
                                  }
                                  sx={{ fontWeight: 500 }}
                                />
                                {event.amount && (
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {new Intl.NumberFormat("en-IN", {
                                      style: "currency",
                                      currency: "INR",
                                    }).format(event.amount)}
                                  </Typography>
                                )}
                              </Box>
                              {event.ts && (
                                <Typography
                                  variant="caption"
                                  sx={{ display: "block", color: "text.secondary" }}
                                >
                                  {new Date(event.ts).toLocaleString()}
                                </Typography>
                              )}
                              {event.source && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    color: "text.secondary",
                                    mt: 0.5,
                                  }}
                                >
                                  Source: {event.source}
                                </Typography>
                              )}
                              {event.orderId && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    color: "text.secondary",
                                    mt: 0.5,
                                    fontFamily: "monospace",
                                  }}
                                >
                                  Order: {event.orderId}
                                </Typography>
                              )}
                              {event.paymentId && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    color: "text.secondary",
                                    mt: 0.5,
                                    fontFamily: "monospace",
                                  }}
                                >
                                  Payment: {event.paymentId}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}

                  {/* Token Usage Status */}
                  {user.token_used !== undefined && (
                    <Box sx={{ mt: 3 }}>
                      <LabelValue
                        label="Payment Token Used"
                        value={user.token_used ? "Yes" : "No"}
                        type="badge"
                        badgeColor={user.token_used ? "info" : "default"}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Right side - Fixed Admin Filled Details Card */}
          <AdminFilledCard
            user={user}
            canEdit={canEdit}
            handleApproval={handleApproval}
            isApproving={isApproving}
            session={session}
            userId={userId}
            queryClient={queryClient}
            setSnack={setSnack}
          />
        </Box>

        {/* Avatar Preview Dialog */}
        <Dialog
          open={avatarDialogOpen}
          onClose={() => setAvatarDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ flex: 1 }}>{userName}</Box>
            <IconButton onClick={() => setAvatarDialogOpen(false)} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{ display: "flex", justifyContent: "center" }}
          >
            {user.photo_url ? (
              <Box
                component="img"
                src={user.photo_url}
                alt={userName}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Typography>No image available</Typography>
            )}
          </DialogContent>
        </Dialog>
      </Box>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
