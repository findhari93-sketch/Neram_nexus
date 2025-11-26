"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, UsersDuplicateRow } from "@/lib/supabaseClient";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Skeleton,
  Link as MuiLink,
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

interface NormalizedUser extends Record<string, unknown> {
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
}

// Avatar component
const AvatarWithFallback: React.FC<{
  src?: string | null;
  name?: string | null;
  size?: number;
  onClick?: () => void;
  avatarPath?: string | null;
}> = ({ src, name, size = 120, onClick, avatarPath }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  // Fetch signed URL for private bucket if avatarPath exists
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!avatarPath || src) return; // Skip if we already have a public URL

      try {
        let cleanPath = avatarPath.trim();
        // Remove "avatars/" prefix if present
        if (cleanPath.startsWith("avatars/")) {
          cleanPath = cleanPath.substring("avatars/".length);
        }

        const { data, error } = await supabase.storage
          .from('avatars')
          .createSignedUrl(cleanPath, 3600); // 1 hour expiry

        if (error) throw error;

        if (data?.signedUrl) {
          setSignedUrl(data.signedUrl);
        }
      } catch (error) {
        console.error('Failed to fetch signed URL:', error);
      }
    };

    fetchSignedUrl();
  }, [avatarPath, src]);

  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((s: string) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : undefined;

  // Priority: signedUrl (from private bucket) > src (public URL like Google) > undefined
  let finalSrc = signedUrl || src || undefined;
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
      <Typography variant="body2">{formatValue()}</Typography>
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

// Helper to resolve photo URL from multiple possible locations
function resolvePhotoFromRow(orig: any): string | undefined {
  if (!orig) return undefined;

  // Helper to get Supabase Storage URL from avatar_path
  const getSupabaseStorageUrl = (avatarPath: string | null | undefined): string | undefined => {
    if (!avatarPath || typeof avatarPath !== "string") return undefined;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return undefined;

    let cleanPath = avatarPath.trim();

    // Extract just the file path (remove "avatars/" prefix if present)
    if (cleanPath.startsWith("avatars/")) {
      cleanPath = cleanPath.substring("avatars/".length);
    }

    // For private buckets, construct authenticated URL with token
    // Format: {supabaseUrl}/storage/v1/object/authenticated/avatars/{path}?token={anonKey}
    return `${supabaseUrl}/storage/v1/object/authenticated/avatars/${cleanPath}?token=${supabaseAnonKey}`;
  };

  // Parse account JSONB if it exists
  let account = orig.account;
  if (typeof account === "string") {
    try {
      account = JSON.parse(account);
    } catch {
      account = undefined;
    }
  }

  // PRIORITY 1: Check account.avatar_path and construct Supabase Storage URL
  if (account && typeof account === "object") {
    const avatarPath = account.avatar_path;
    if (avatarPath) {
      const storageUrl = getSupabaseStorageUrl(avatarPath);
      if (storageUrl) return storageUrl;
    }
  }

  // PRIORITY 2: Check account.photo_url or other direct URL fields
  const candidates = [
    "photo_url",
    "photoUrl",
    "avatar",
    "image",
    "profile_image",
    "profilePhoto",
  ];

  const getFrom = (obj: any) => {
    if (!obj || typeof obj !== "object") return undefined;
    for (const k of candidates) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        const v = obj[k];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
    }
    return undefined;
  };

  // Check account object for photo URLs
  if (account) {
    const found = getFrom(account);
    if (found) return found;
  }

  // 3) direct keys on the row
  const direct = getFrom(orig);
  if (direct) return direct;

  // 4) common account/basic containers (may be object or JSON string)
  const containerKeys = [
    "account_details",
    "account_info",
    "basic",
    "basic_info",
    "auth",
    "provider_info",
  ];

  for (const key of containerKeys) {
    let container = orig[key];
    if (!container) continue;
    if (typeof container === "string") {
      try {
        container = JSON.parse(container);
      } catch {
        container = undefined;
      }
    }
    const found = getFrom(container);
    if (found) return found;
  }

  // 5) last-resort: check any top-level string fields that look like JSON
  for (const k of Object.keys(orig)) {
    const v = orig[k];
    if (typeof v === "string" && v.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(v);
        const found = getFrom(parsed);
        if (found) return found;
      } catch {
        // ignore parse failures
      }
    }
  }

  return undefined;
}

// Normalization helper (simplified from WebUsersGrid)
function normalizeUser(raw: RawRow): NormalizedUser {
  const out: any = { ...raw };
  out.id = raw.id;

  // Parse account JSONB
  const account =
    typeof raw.account === "string"
      ? JSON.parse(raw.account || "{}")
      : raw.account || {};
  out.photo_url = resolvePhotoFromRow(raw);
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
  out.payment_id = payment.payment_id;
  out.order_id = payment.order_id;
  out.amount = payment.amount;
  out.currency = payment.currency;
  out.upi_id = payment.upi_id;
  out.bank = payment.bank;
  out.receipt = payment.receipt;
  out.verified = payment.verified;
  out.signature = payment.signature;
  out.installment_type = payment.installment_type;

  return out as NormalizedUser;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const queryClient = useQueryClient();

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

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
        return normalizeUser(byId.data as RawRow);
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

      return normalizeUser(byFirebase.data as RawRow);
    },
  });


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
            onClick={() => router.push("/web-users")}
            sx={{ mb: 3 }}
          >
            Back to Users
          </Button>
          <Alert severity="error">
            {error instanceof Error ? error.message : "User not found"}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  const userName =
    user.student_name || user.display_name || user.name || "User Details";
  const providers = Array.isArray(user.providers)
    ? user.providers
    : typeof user.providers === "string"
    ? [user.providers]
    : [];

  // Extract avatar_path from raw data (before normalization)
  let avatarPath: string | null = null;
  try {
    // Get the raw query data to access account JSONB
    const rawData = queryClient.getQueryData(["user", userId]) as any;
    if (rawData) {
      const account = typeof rawData.account === 'string'
        ? JSON.parse(rawData.account)
        : rawData.account;
      avatarPath = account?.avatar_path || null;
    }
  } catch (e) {
    // Ignore parse errors
  }

  return (
    <ThemeProvider theme={mrtTheme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/web-users")}
          sx={{ mb: 2 }}
        >
          Back to Users
        </Button>

        {/* Page Title */}
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          {userName}
        </Typography>

        {/* Cards - Flex two-column responsive */}
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
                  avatarPath={avatarPath}
                  name={userName}
                  size={120}
                  onClick={() => setAvatarDialogOpen(true)}
                />
              </Box>
              <LabelValue label="Student Name" value={user.student_name} />
              <LabelValue label="Father Name" value={user.father_name} />
              <LabelValue label="Gender" value={user.gender} />
              <LabelValue label="Date of Birth" value={user.dob} type="date" />
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
                badgeColor={user.application_submitted ? "success" : "warning"}
              />
              <LabelValue
                label="Submitted Date/Time"
                value={user.app_submitted_date_time}
                type="date"
              />
              <LabelValue
                label="Admin Approval Status"
                value={user.application_admin_approval ? String(user.application_admin_approval) : undefined}
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
              <LabelValue label="Approved By" value={user.approved_by ? String(user.approved_by) : undefined} />
              <LabelValue label="Email Status" value={user.email_status} />
              <LabelValue
                label="Email Sent At"
                value={user.email_sent_at}
                type="date"
              />
            </InfoCard>
          </Box>

          {/* CARD 5: Admin Filled Details */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              p: 1.5,
              boxSizing: "border-box",
            }}
          >
            <InfoCard title="Admin Filled Details" icon={<SchoolIcon />}>
              <LabelValue
                label="Final Course Name"
                value={user.final_course_Name}
              />
              <LabelValue
                label="Course Duration"
                value={user.course_duration}
              />
              <LabelValue
                label="Payment Options"
                value={user.payment_options}
              />
              <LabelValue
                label="Total Course Fees"
                value={user.total_course_fees != null ? Number(user.total_course_fees) : undefined}
                type="currency"
              />
              <LabelValue
                label="First Installment"
                value={user.first_installment_amount != null ? Number(user.first_installment_amount) : undefined}
                type="currency"
              />
              <LabelValue
                label="Second Installment"
                value={user.second_installment_amount != null ? Number(user.second_installment_amount) : undefined}
                type="currency"
              />
              <LabelValue
                label="Second Installment Date"
                value={user.second_installment_date}
                type="date"
              />
              <LabelValue
                label="Final Fee Payment"
                value={user.final_fee_payment_amount != null ? Number(user.final_fee_payment_amount) : undefined}
                type="currency"
              />
              <LabelValue
                label="Remaining Fees"
                value={user.remaining_fees != null ? Number(user.remaining_fees) : undefined}
                type="currency"
              />
              <LabelValue
                label="Discount"
                value={user.discount != null ? Number(user.discount) : undefined}
                type="currency"
              />
              <LabelValue
                label="Will Study Next Year"
                value={user.will_study_next_year}
              />
              <LabelValue
                label="NATA Attempt Year"
                value={user.nata_attempt_year}
              />
              <LabelValue
                label="Offer Before Date"
                value={user.offer_before_date}
                type="date"
              />
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
                  Admin Comment
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  {user.admin_comment ?? "—"}
                </Box>
              </Box>
            </InfoCard>
          </Box>

          {/* CARD 6: Payment Details */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              p: 1.5,
              boxSizing: "border-box",
            }}
          >
            <InfoCard title="Payment Details" icon={<PaymentIcon />}>
              <LabelValue
                label="Payment Status"
                value={user.payment_status}
                type="badge"
                badgeColor={
                  user.payment_status === "captured" ||
                  user.payment_status === "success"
                    ? "success"
                    : user.payment_status === "failed"
                    ? "error"
                    : "warning"
                }
              />
              <LabelValue label="Payment Method" value={user.payment_method} />
              <LabelValue
                label="Payment Date"
                value={user.payment_at}
                type="date"
              />
              <LabelValue label="Payment ID" value={user.payment_id} />
              <LabelValue label="Order ID" value={user.order_id} />
              <LabelValue label="Amount" value={user.amount != null ? Number(user.amount) : undefined} type="currency" />
              <LabelValue label="Currency" value={user.currency} />
              <LabelValue label="UPI ID" value={user.upi_id} />
              <LabelValue label="Bank" value={user.bank} />
              <LabelValue label="Receipt" value={user.receipt} />
              <LabelValue
                label="Verified"
                value={user.verified ? "Yes" : "No"}
                type="badge"
                badgeColor={user.verified ? "success" : "warning"}
              />
              <LabelValue label="Signature" value={user.signature} />
              <LabelValue
                label="Installment Type"
                value={user.installment_type}
              />
            </InfoCard>
          </Box>
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
    </ThemeProvider>
  );
}
