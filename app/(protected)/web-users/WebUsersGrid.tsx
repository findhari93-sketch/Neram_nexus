"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { supabase, UsersDuplicateRow } from "@/lib/supabaseClient";
import {
  Box,
  Button,
  Snackbar,
  Alert,
  Typography,
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
  Avatar,
  Checkbox,
  IconButton,
  InputAdornment,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import type { Theme } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { z } from "zod";
import mrtTheme, { mrtTableProps } from "../mrtTheme";

// Default props used for per-column filter text fields to avoid repetition
const defaultFilterProps = ({ column }: any) => {
  const base: any = mrtTableProps?.muiFilterTextFieldProps ?? {};

  return {
    ...base,
    placeholder: "",
    InputProps: {
      ...(base.InputProps ?? {}),
      endAdornment: column.getFilterValue() ? (
        <InputAdornment position="end">
          <IconButton
            size="small"
            onClick={() => column.setFilterValue(undefined)}
            aria-label="Clear filter"
          >
            ×
          </IconButton>
        </InputAdornment>
      ) : undefined,
    },
  } as any;
};
import ErrorBoundary from "./ErrorBoundary";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Normalized user type for the grid (builds on the Supabase row type)
interface NormalizedUser extends Record<string, unknown> {
  id?: string | number;
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
  // Contact details
  city?: string;
  email?: string;
  phone?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  // Basic details
  father_name?: string;
  gender?: string;
  dob?: string;
  // Application details
  application_submitted?: boolean;
  app_submitted_date_time?: string;
  application_admin_approval?: unknown;
  approved_at?: string;
  approved_by?: unknown;
  email_status?: string;
  email_sent_at?: string;
  // Admin filled details
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
  // Final fee payment details
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
type RawRow = Record<string, any>;

// Zod schemas (permissive, use .passthrough() to allow extra keys)
const AccountSchema = z
  .object({
    photo_url: z.string().nullable().optional(),
    photoUrl: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    profile_image: z.string().nullable().optional(),
    profilePhoto: z.string().nullable().optional(),
    providers: z.any().optional(),
    created_at: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    account_type: z.string().nullable().optional(),
    display_name: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    firebase_uid: z.string().nullable().optional(),
    uid: z.string().nullable().optional(),
    last_sign_in: z.string().nullable().optional(),
    phone_auth_used: z.union([z.boolean(), z.string(), z.null()]).optional(),
    phone_verified: z.union([z.boolean(), z.string(), z.null()]).optional(),
  })
  .passthrough();

const BasicSchema = z
  .object({
    student_name: z.string().nullable().optional(),
    studentName: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    full_name: z.string().nullable().optional(),
    father_name: z.string().nullable().optional(),
    fatherName: z.string().nullable().optional(),
    gender: z.string().nullable().optional(),
    sex: z.string().nullable().optional(),
    dob: z.string().nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
  })
  .passthrough();

const ContactSchema = z
  .object({
    city: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    primary_email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    mobile: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    zip_code: z.string().nullable().optional(),
    zip: z.string().nullable().optional(),
  })
  .passthrough();

const EducationSchema = z
  .object({
    education_type: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    board: z.string().nullable().optional(),
    board_year: z.string().nullable().optional(),
    school_std: z.any().optional(),
    diploma_course: z.string().nullable().optional(),
    diploma_year: z.string().nullable().optional(),
    school_name: z.string().nullable().optional(),
  })
  .passthrough();

const ApplicationSchema = z
  .object({
    application_submitted: z.union([z.boolean(), z.string(), z.null()]).optional(),
    submitted: z.union([z.boolean(), z.string(), z.null()]).optional(),
    is_submitted: z.union([z.boolean(), z.string(), z.null()]).optional(),
    app_submitted_date_time: z.string().nullable().optional(),
    submitted_at: z.string().nullable().optional(),
    submittedAt: z.string().nullable().optional(),
    application_admin_approval: z.any().optional(),
    approved_at: z.string().nullable().optional(),
    approved_by: z.any().optional(),
    email_status: z.string().nullable().optional(),
    email_sent_at: z.string().nullable().optional(),
  })
  .passthrough();

const AdminFilledSchema = z
  .object({
    discount: z.any().optional(),
    admin_comment: z.any().optional(),
    remaining_fees: z.any().optional(),
    course_duration: z.any().optional(),
    payment_options: z.any().optional(),
  })
  .passthrough();

const ProvidersSchema = z.any();

// Zod schema for the normalized user shape. We allow rows without names
// and will provide a fallback (User #ID) in the UI when rendering.
const NormalizedUserSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    photo_url: z.string().nullable().optional(),
    student_name: z.string().nullable().optional(),
    display_name: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    providers: z.any().optional(),
    contact: z.any().optional(),
    created_at: z.string().nullable().optional(),
    last_sign_in: z.string().nullable().optional(),
  })
  .passthrough();

// Named constants for commonly-used numeric values to avoid magic numbers
// Default avatar size for the grid (use 24x24 to keep rows compact)
const DEFAULT_AVATAR_SIZE = 24;
const DEFAULT_PAGE_SIZE = 50;
const TABLE_CONTAINER_OFFSET_PX = 280; // used in `calc(100vh - ${TABLE_CONTAINER_OFFSET_PX}px)`

// AvatarWithFallback: resolves image URL from multiple row locations (top-level, account containers,
// JSON strings) and falls back to initials if image fails to load or is unavailable.
function resolvePhotoFromRow(orig: any): string | undefined {
  if (!orig) return undefined;

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

  // 1) direct keys on the row
  const direct = getFrom(orig);
  if (direct) return direct;

  // 2) common account/basic containers (may be object or JSON string)
  const containerKeys = [
    "account",
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

  // 3) last-resort: check any top-level string fields that look like JSON
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

const AvatarWithFallback: React.FC<{
  src?: string | null;
  name?: string | null;
  size?: number;
  placeholderVariant?: "gradient" | "color";
  placeholderColors?: string[];
  onClick?: () => void;
}> = React.memo(
  ({
    src,
    name,
    size = DEFAULT_AVATAR_SIZE,
    placeholderVariant = "gradient",
    placeholderColors,
    onClick,
  }) => {
    const [imgFailed, setImgFailed] = useState(false);
    // track mounted state so async image callbacks don't set state after unmount
    const mountedRef = useRef(true);
    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

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
      finalSrc.startsWith("http://") &&
      typeof window !== "undefined"
    ) {
      finalSrc = finalSrc.replace(/^http:\/\//i, "https://");
    }

    // deterministic palette selection based on name
    const palette =
      placeholderColors && placeholderColors.length > 0
        ? placeholderColors
        : [
            "#60a5fa",
            "#f472b6",
            "#f97316",
            "#34d399",
            "#a78bfa",
            "#06b6d4",
            "#fb7185",
            "#f59e0b",
          ];

    const hashString = (str?: string | null) => {
      if (!str) return 0;
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h);
    };

    const idx = hashString(name) % palette.length;
    const color1 = palette[idx];
    const color2 =
      palette[(idx + Math.floor(palette.length / 2)) % palette.length];

    // color utilities
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
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
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

    const placeholderSx: any =
      placeholderVariant === "gradient"
        ? {
            backgroundImage: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
          }
        : { bgcolor: color1 };

    return (
      <Avatar
        src={!imgFailed ? finalSrc : undefined}
        alt={name ?? undefined}
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          color: textColor,
          fontWeight: 600,
          cursor: "pointer",
          ...(!finalSrc || imgFailed ? placeholderSx : {}),
        }}
        imgProps={{
          onError: () => {
            if (mountedRef.current) {
              setImgFailed(true);
            }
          },
        }}
      >
        {!finalSrc || imgFailed ? initials ?? null : null}
      </Avatar>
    );
  }
);

// Memoized small cell components to reduce per-row work
const ProvidersCell: React.FC<{ original: NormalizedUser }> = React.memo(
  ({ original }) => {
    const v = original?.providers;
    try {
      if (Array.isArray(v)) return <>{String(v.join(", "))}</>;
      if (typeof v === "string") return <>{v}</>;
      return <></>;
    } catch {
      return <></>;
    }
  }
);

const ContactCell: React.FC<{ original: NormalizedUser }> = React.memo(
  ({ original }) => {
    // Prefer top-level normalized fields when available (these are populated
    // during normalization). Fall back to the raw `contact` object only when
    // top-level fields are absent.
    const topPhone =
      typeof original.phone === "string" ? original.phone : undefined;
    const topEmail =
      typeof original.email === "string" ? original.email : undefined;
    const topCity =
      typeof original.city === "string" ? original.city : undefined;
    const topState =
      typeof original.state === "string" ? original.state : undefined;

    if (topPhone || topEmail || topCity || topState) {
      return <>{topPhone ?? topEmail ?? topCity ?? topState}</>;
    }

    const v = original?.contact as unknown;
    if (!v && v !== 0) return <></>;
    if (typeof v === "string" || typeof v === "number") return <>{String(v)}</>;
    if (typeof v === "object" && v !== null) {
      const o = v as Record<string, unknown>;
      const phone = typeof o.phone === "string" ? o.phone : undefined;
      const email = typeof o.email === "string" ? o.email : undefined;
      const city = typeof o.city === "string" ? o.city : undefined;
      const state = typeof o.state === "string" ? o.state : undefined;
      return <>{phone ?? email ?? city ?? state ?? JSON.stringify(o)}</>;
    }
    return <></>;
  }
);

// Generic cell to render a single contact field (phone/email/city/state/country/zip)
const ContactFieldCell: React.FC<{
  original: NormalizedUser;
  field: "phone" | "email" | "city" | "state" | "country" | "zip_code";
}> = React.memo(({ original, field }) => {
  const getContactField = (
    orig: NormalizedUser,
    fld: string
  ): string | undefined => {
    const top = orig[fld as keyof NormalizedUser];
    if (typeof top === "string" && top.trim()) return top;

    const c = orig.contact as unknown;
    if (c === null || c === undefined) return undefined;
    if (typeof c === "string" || typeof c === "number") {
      return String(c);
    }
    if (typeof c === "object") {
      const o = c as Record<string, unknown>;
      const mapping: Record<string, string[]> = {
        phone: ["phone", "mobile"],
        email: ["email", "primary_email"],
        city: ["city"],
        state: ["state"],
        country: ["country"],
        zip_code: ["zip_code", "zip"],
      };
      const keys = mapping[fld] ?? [fld];
      for (const k of keys) {
        const v = o[k];
        if (typeof v === "string" && v.trim()) return v;
        if (typeof v === "number") return String(v);
      }
    }
    return undefined;
  };

  const value = getContactField(original, field);
  return <>{value ?? ""}</>;
});

const DateCell: React.FC<{
  value?: string | number | Date | null | undefined;
}> = React.memo(({ value }) => {
  if (!value && value !== 0) return <></>;
  try {
    return <>{new Date(String(value)).toLocaleString()}</>;
  } catch {
    return <>{String(value)}</>;
  }
});

const BoolCell: React.FC<{ value?: boolean | any; label?: string }> =
  React.memo(({ value, label }) => {
    const checked = Boolean(value);
    const ariaLabel = label
      ? `${label}: ${checked ? "yes" : "no"}`
      : `Value: ${checked ? "yes" : "no"}`;

    return (
      <Checkbox
        checked={checked}
        size="small"
        // Make the underlying input readOnly so the control remains focusable
        // and accessible to screen readers while preventing user changes.
        inputProps={{ "aria-label": ariaLabel, readOnly: true }}
        onChange={() => {}}
        title={ariaLabel}
      />
    );
  });

// Editable cell component for inline editing
const EditableCell: React.FC<{
  value: any;
  isEditing: boolean;
  onChange: (value: any) => void;
  field: keyof NormalizedUser;
  placeholder?: string;
}> = React.memo(({ value, isEditing, onChange, field, placeholder }) => {
  if (!isEditing) {
    return <span>{value || "—"}</span>;
  }

  return (
    <TextField
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      size="small"
      fullWidth
      variant="outlined"
      sx={{
        "& .MuiOutlinedInput-root": {
          fontSize: "0.875rem",
          backgroundColor: "rgba(25, 118, 210, 0.04)",
        },
      }}
    />
  );
});

// Helper: parse a value that may be an object or a JSON string and optionally
// validate it with a Zod schema. Returns `undefined` on parse/validation failure.
function parseMaybeJson(value: any, schema?: any) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object") {
    if (!schema) return value;
    const res = schema.safeParse(value);
    return res.success ? res.data : undefined;
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return undefined;
    try {
      const parsed = JSON.parse(s);
      if (!schema) return parsed;
      const res = schema.safeParse(parsed);
      return res.success ? res.data : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function normalizeAccount(orig: RawRow, out: any) {
  let account: any | undefined;
  const accountSources: Array<[string, any]> = [
    ["account", orig.account],
    ["account_details", orig.account_details],
    ["account_info", orig.account_info],
    ["auth", orig.auth],
    ["provider_info", orig.provider_info],
  ];
  for (const [key, val] of accountSources) {
    if (val !== undefined && val !== null) {
      const parsed = parseMaybeJson(val, AccountSchema);
      if (parsed === undefined && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("Account data failed validation", { key, value: val });
      }
      account = account ?? parsed;
    }
  }
  account = account ?? (typeof orig === "object" ? orig : undefined);

  if (!account) return;
  out.photo_url =
    out.photo_url ??
    account.photo_url ??
    account.photoUrl ??
    account.avatar ??
    account.image ??
    account.profile_image ??
    account.profilePhoto ??
    undefined;

  out.providers = out.providers ?? account.providers ?? account.provider;
  out.created_at = out.created_at ?? account.created_at ?? account.createdAt;
  out.account_type = out.account_type ?? account.account_type ?? account.type;
  out.display_name = out.display_name ?? account.display_name ?? account.name;
  out.firebase_uid = out.firebase_uid ?? account.firebase_uid ?? account.uid;
  out.phone_auth_used =
    out.phone_auth_used ??
    account.phone_auth_used ??
    account.phone_verified ??
    false;
}

function normalizeBasic(orig: RawRow, out: any) {
  let basic: any | undefined;
  const basicSources: Array<[string, any]> = [
    ["basic", orig.basic],
    ["basic_info", orig.basic_info],
  ];
  for (const [key, val] of basicSources) {
    if (val !== undefined && val !== null) {
      const parsed = parseMaybeJson(val, BasicSchema);
      if (parsed === undefined && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("Basic data failed validation", { key, value: val });
      }
      basic = basic ?? parsed;
    }
  }
  if (basic) {
    out.student_name =
      out.student_name ??
      basic.student_name ??
      basic.studentName ??
      basic.name ??
      basic.full_name ??
      basic.name ??
      undefined;
    out.father_name = out.father_name ?? basic.father_name ?? basic.fatherName;
    out.gender = out.gender ?? basic.gender ?? basic.sex;
    out.dob = out.dob ?? basic.dob ?? basic.date_of_birth;
  } else {
    // fall back to top-level fields
    out.student_name =
      out.student_name ?? orig.student_name ?? orig.display_name ?? orig.name;
    out.father_name = out.father_name ?? orig.father_name ?? orig.fatherName;
    out.gender = out.gender ?? orig.gender ?? orig.sex;
    out.dob = out.dob ?? orig.dob ?? orig.date_of_birth;
  }
}

function normalizeContact(orig: RawRow, out: any) {
  // Keep the nested contact canonical. Populate `out.contact` with the
  // parsed container (or raw value) and avoid copying individual fields to
  // top-level keys. Components should prefer `original.phone`/`email` when
  // explicitly normalized, otherwise read from `original.contact`.
  let contact: any | undefined;
  const contactSources: Array<[string, any]> = [
    ["contact", orig.contact],
    ["contact_info", orig.contact_info],
  ];
  for (const [key, val] of contactSources) {
    if (val !== undefined && val !== null) {
      const parsed = parseMaybeJson(val, ContactSchema);
      if (parsed === undefined && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("Contact data failed validation", { key, value: val });
      }
      contact = contact ?? parsed ?? val;
    }
  }

  if (contact !== undefined) {
    out.contact = out.contact ?? contact;
  }
}

function normalizeEducation(orig: RawRow, out: any) {
  let edu: any | undefined;
  const eduSources: Array<[string, any]> = [
    ["education", orig.education],
    ["education_info", orig.education_info],
  ];
  for (const [key, val] of eduSources) {
    if (val !== undefined && val !== null) {
      const parsed = parseMaybeJson(val, EducationSchema);
      if (parsed === undefined && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("Education data failed validation", { key, value: val });
      }
      edu = edu ?? parsed;
    }
  }
  if (edu) {
    out.education_type = out.education_type ?? edu.education_type ?? edu.type;
    out.board = out.board ?? edu.board;
    out.board_year = out.board_year ?? edu.board_year;
    out.school_std = out.school_std ?? edu.school_std;
    out.diploma_course = out.diploma_course ?? edu.diploma_course;
    out.diploma_year = out.diploma_year ?? edu.diploma_year;
    out.school_name = out.school_name ?? edu.school_name;
  } else {
    // Fallbacks to top-level if parsing failed
    out.education_type = out.education_type ?? orig.education_type ?? orig.type;
    out.board = out.board ?? orig.board;
    out.board_year = out.board_year ?? orig.board_year;
    out.school_std = out.school_std ?? orig.school_std;
    out.diploma_course = out.diploma_course ?? orig.diploma_course;
    out.diploma_year = out.diploma_year ?? orig.diploma_year;
    out.school_name = out.school_name ?? orig.school_name;
  }
}

function normalizeApplication(orig: RawRow, out: any) {
  let app: any | undefined;
  const appSources: Array<[string, any]> = [
    ["application", orig.application],
    ["application_info", orig.application_info],
    ["application_details", orig.application_details],
    ["applicationDetails", orig.applicationDetails],
  ];
  for (const [key, val] of appSources) {
    if (val !== undefined && val !== null) {
      const parsed = parseMaybeJson(val, ApplicationSchema);
      if (parsed === undefined && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("Application data failed validation", { key, value: val });
      }
      app = app ?? parsed;
    }
  }
  if (!app) {
    // Fallbacks to top-level
    out.application_submitted =
      out.application_submitted ??
      orig.application_submitted ??
      orig.submitted ??
      orig.is_submitted;
    out.app_submitted_date_time =
      out.app_submitted_date_time ??
      orig.app_submitted_date_time ??
      orig.submitted_at ??
      orig.submittedAt;
    out.application_admin_approval =
      out.application_admin_approval ??
      orig.application_admin_approval ??
      orig.applicationAdminApproval;
    out.approved_at = out.approved_at ?? orig.approved_at ?? orig.approvedAt;
    out.approved_by = out.approved_by ?? orig.approved_by ?? orig.approvedBy;
    return;
  }
  out.application_submitted =
    out.application_submitted ??
    app.application_submitted ??
    app.submitted ??
    app.is_submitted;
  out.app_submitted_date_time =
    out.app_submitted_date_time ??
    app.app_submitted_date_time ??
    app.submitted_at ??
    app.submittedAt;
  out.application_admin_approval =
    out.application_admin_approval ??
    app.application_admin_approval ??
    app.applicationAdminApproval;
  out.approved_at = out.approved_at ?? app.approved_at ?? app.approvedAt;
  out.approved_by = out.approved_by ?? app.approved_by ?? app.approvedBy;
}

function normalizeAdminFilled(orig: RawRow, out: any) {
  let adm: any | undefined;
  const admSources: Array<[string, any]> = [
    ["admin_filled", orig.admin_filled],
    ["adminFilled", orig.adminFilled],
  ];
  for (const [key, val] of admSources) {
    if (val !== undefined && val !== null) {
      const parsed = parseMaybeJson(val, AdminFilledSchema);
      if (parsed === undefined && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("AdminFilled data failed validation", { key, value: val });
      }
      adm = adm ?? parsed;
    }
  }
  if (!adm) {
    // Fallbacks to top-level
    out.discount = out.discount ?? orig.discount;
    out.admin_comment = out.admin_comment ?? orig.admin_comment;
    out.remaining_fees = out.remaining_fees ?? orig.remaining_fees;
    out.course_duration = out.course_duration ?? orig.course_duration;
    out.payment_options = out.payment_options ?? orig.payment_options;
    out.final_course_Name =
      out.final_course_Name ?? orig.final_course_Name ?? orig.finalCourseName;
    out.total_course_fees = out.total_course_fees ?? orig.total_course_fees;
    out.first_installment_amount =
      out.first_installment_amount ?? orig.first_installment_amount;
    out.second_installment_amount =
      out.second_installment_amount ?? orig.second_installment_amount;
    out.second_installment_date =
      out.second_installment_date ?? orig.second_installment_date;
    out.final_fee_payment_amount =
      out.final_fee_payment_amount ?? orig.final_fee_payment_amount;
    return;
  }
  out.discount = out.discount ?? adm.discount;
  out.admin_comment = out.admin_comment ?? adm.admin_comment;
  out.remaining_fees = out.remaining_fees ?? adm.remaining_fees;
  out.course_duration = out.course_duration ?? adm.course_duration;
  out.payment_options = out.payment_options ?? adm.payment_options;
  out.final_course_Name =
    out.final_course_Name ?? adm.final_course_Name ?? adm.finalCourseName;
  out.total_course_fees = out.total_course_fees ?? adm.total_course_fees;
  out.first_installment_amount =
    out.first_installment_amount ?? adm.first_installment_amount;
  out.second_installment_amount =
    out.second_installment_amount ?? adm.second_installment_amount;
  out.second_installment_date =
    out.second_installment_date ?? adm.second_installment_date;
  out.final_fee_payment_amount =
    out.final_fee_payment_amount ?? adm.final_fee_payment_amount;
}

function normalizeProviders(out: any) {
  const p = out.providers;
  if (p === undefined || p === null) return;
  if (Array.isArray(p)) return;
  if (typeof p === "string") {
    const parsed = parseMaybeJson(p);
    if (parsed !== undefined) {
      out.providers = Array.isArray(parsed) ? parsed : parsed;
    } else if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("Providers string failed to parse as JSON", {
        providers: p,
      });
    }
  }
}

// Hook to get current user's role from auth system
// TODO: Replace this with actual auth logic from your Supabase auth or session provider
const useCurrentUserRole = (): string | null => {
  // For now, returning "admin" for testing
  // In production, fetch from: supabase.auth.getUser() or your session/context
  return "admin"; // Change this to fetch real role: "admin" | "super_admin" | "teacher" | "student" | null
};

const WebUsersGrid: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userRole = useCurrentUserRole();
  const canEdit = userRole === "admin" || userRole === "super_admin";

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // Use React Query to fetch and cache Supabase data with pagination
  const { data, isLoading, isError, error, isRefetching, refetch } = useQuery({
    queryKey: ["users_duplicate", pagination.pageIndex, pagination.pageSize],
    queryFn: async () => {
      const start = pagination.pageIndex * pagination.pageSize;
      const end = start + pagination.pageSize - 1;

      // Fetch paginated data with count
      const { data, error, count } = await supabase
        .from("users_duplicate")
        .select("*", { count: "exact" })
        .range(start, end)
        .order("id", { ascending: false }); // Order by ID descending for newest first

      if (error) throw new Error(error.message);

      // Normalize rows: flatten commonly-used nested JSON columns (account/contact)
      const raw = (data as RawRow[]) ?? [];
      const normalized: NormalizedUser[] = raw.map((r) => {
        const out: any = { ...r };
        // apply per-container normalizers
        normalizeAccount(r, out);
        normalizeBasic(r, out);
        normalizeContact(r, out);
        normalizeEducation(r, out);
        normalizeApplication(r, out);
        normalizeAdminFilled(r, out);
        normalizeProviders(out);

        // Resolve and cache photo URL during normalization so render-time
        // components (like Avatar) don't need to re-run expensive parsing.
        try {
          const resolved = resolvePhotoFromRow(out);
          if (resolved) {
            out.photo_url = out.photo_url ?? resolved;
          }
        } catch {
          // swallow any unexpected errors during normalization
        }

        return out as NormalizedUser;
      });

      // Lenient validation: attempt to parse but never skip rows. If parsing
      // fails, keep the original normalized row and log a dev-only warning.
      const finalRows: NormalizedUser[] = [];
      let validationErrors = 0;
      for (const nr of normalized) {
        const res = NormalizedUserSchema.safeParse(nr);
        if (res.success) {
          finalRows.push(res.data as NormalizedUser);
        } else {
          validationErrors++;
          if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.warn("Row failed schema validation (kept anyway)", {
              row: nr,
              issues: res.error.issues,
            });
          }
          finalRows.push(nr as NormalizedUser);
        }
      }

      return {
        rows: finalRows,
        rowCount: count ?? finalRows.length,
        validationErrors,
      };
    },
    placeholderData: (previousData) => previousData, // Keep previous page data while fetching new page (replaces keepPreviousData in v5)
  });

  const rows = data?.rows ?? [];
  const rowCount = data?.rowCount ?? 0;

  // Snackbar visibility state so users can dismiss the error message
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  useEffect(() => {
    setSnackbarOpen(Boolean(isError));
  }, [isError]);

  // Validation Snackbar state for rows skipped due to malformed data
  const [validationSnackbarOpen, setValidationSnackbarOpen] = useState(false);
  const [validationErrorsCount, setValidationErrorsCount] = useState(0);
  useEffect(() => {
    const v = (data as any)?.validationErrors ?? 0;
    setValidationErrorsCount(v);
    setValidationSnackbarOpen(Boolean(v));
  }, [data?.validationErrors]);

  const filteredRows = rows;

  // Avatar dialog state for previewing an image when avatar is clicked
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarDialogSrc, setAvatarDialogSrc] = useState<string | undefined>();
  const [avatarDialogName, setAvatarDialogName] = useState<
    string | undefined
  >();

  // Edit mode state: track which row is being edited and the edited values
  const [editingRowId, setEditingRowId] = useState<string | number | null>(null);
  const [editedData, setEditedData] = useState<Partial<NormalizedUser>>({});

  // Save/error snackbars for edit operations
  const [saveSnackbar, setSaveSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const openAvatar = (orig: NormalizedUser, name?: string) => {
    const src =
      resolvePhotoFromRow(orig) ?? (orig.photo_url as string | undefined);
    setAvatarDialogSrc(src);
    setAvatarDialogName(name ?? (orig.student_name as string | undefined));
    setAvatarDialogOpen(true);
  };

  const closeAvatar = () => {
    setAvatarDialogOpen(false);
    setAvatarDialogSrc(undefined);
    setAvatarDialogName(undefined);
  };

  // Mutation to update user data in Supabase
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: any }) => {
      // First, fetch the current row to get existing JSONB data
      const { data: currentRow, error: fetchError } = await supabase
        .from("users_duplicate")
        .select("basic, contact, admin_filled")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Merge new data with existing JSONB objects
      const updatePayload: any = {};

      if (data.basic) {
        updatePayload.basic = { ...(currentRow?.basic || {}), ...data.basic };
      }

      if (data.contact) {
        updatePayload.contact = {
          ...(currentRow?.contact || {}),
          ...data.contact,
        };
      }

      if (data.admin_filled) {
        updatePayload.admin_filled = {
          ...(currentRow?.admin_filled || {}),
          ...data.admin_filled,
        };
      }

      // Update the row with merged data
      const { error } = await supabase
        .from("users_duplicate")
        .update(updatePayload)
        .eq("id", id);

      if (error) throw error;
      return { id, data: updatePayload };
    },
    onSuccess: () => {
      // Invalidate and refetch the user list
      queryClient.invalidateQueries({
        queryKey: [
          "users_duplicate",
          pagination.pageIndex,
          pagination.pageSize,
        ],
      });
      setSaveSnackbar({
        open: true,
        message: "User updated successfully!",
        severity: "success",
      });
      setEditingRowId(null);
      setEditedData({});
    },
    onError: (error: any) => {
      console.error("Update failed:", error);
      setSaveSnackbar({
        open: true,
        message: `Failed to update user: ${error.message || "Unknown error"}`,
        severity: "error",
      });
    },
  });

  // Action handlers for row action buttons
  const handleOpen = (orig: NormalizedUser) => {
    const id = orig.id ?? orig.firebase_uid;
    if (id) {
      router.push(`/web-users/${String(id)}`);
    }
  };

  const startEdit = (orig: NormalizedUser) => {
    if (!canEdit || !orig.id) return;
    setEditingRowId(orig.id);
    // Initialize editedData with current row values
    setEditedData({ ...orig });
  };

  const saveEdit = async () => {
    if (editingRowId === null) return;

    // Map flat fields to JSONB structure based on database schema
    const updateData: any = {};

    // Fields that go into 'basic' JSONB column
    const basicFields: any = {};
    if ("student_name" in editedData)
      basicFields.student_name = editedData.student_name;
    if ("father_name" in editedData)
      basicFields.father_name = editedData.father_name;
    if ("gender" in editedData) basicFields.gender = editedData.gender;
    if ("dob" in editedData) basicFields.dob = editedData.dob;

    if (Object.keys(basicFields).length > 0) {
      updateData.basic = basicFields;
    }

    // Fields that go into 'contact' JSONB column
    const contactFields: any = {};
    if ("email" in editedData) contactFields.email = editedData.email;
    if ("phone" in editedData) contactFields.phone = editedData.phone;
    if ("city" in editedData) contactFields.city = editedData.city;
    if ("state" in editedData) contactFields.state = editedData.state;
    if ("country" in editedData) contactFields.country = editedData.country;
    if ("zip_code" in editedData) contactFields.zip_code = editedData.zip_code;

    if (Object.keys(contactFields).length > 0) {
      updateData.contact = contactFields;
    }

    updateUserMutation.mutate({ id: editingRowId, data: updateData });
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditedData({});
  };

  const handleFieldChange = (field: keyof NormalizedUser, value: any) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (orig: NormalizedUser) => {
    if (!canEdit) {
      alert("You don't have permission to edit this row");
      return;
    }
    startEdit(orig);
  };

  const columns = useMemo<MRT_ColumnDef<NormalizedUser>[]>(
    () => [
      // Actions column (shows on row hover)
      {
        id: "actions",
        header: "",
        muiTableHeadCellProps: { sx: { width: 72, textAlign: "center" } },
        columns: [
          {
            accessorKey: "actions",
            header: "",
            size: 110,
            enableColumnActions: false,
            // Hide move/drag and column-actions icons for the actions column header
            muiTableHeadCellProps: {
              sx: {
                "& .mrt-column-drag-button, & .mrt-column-actions-button, & .mrt-resize-handle":
                  {
                    display: "none !important",
                  },
                textAlign: "center",
              },
            },
            enableSorting: false,
            enableColumnFilter: false,
            Cell: ({ row }) => {
              const orig = row.original as NormalizedUser;
              const isEditing = editingRowId === orig.id;
              const isSaving =
                updateUserMutation.isPending && editingRowId === orig.id;

              if (isEditing) {
                return (
                  <Box
                    sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
                  >
                    <Tooltip title="Save changes" arrow>
                      <IconButton
                        size="small"
                        onClick={saveEdit}
                        disabled={isSaving}
                        aria-label="Save changes"
                        sx={{
                          padding: "4px",
                          color: "success.main",
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        {isSaving ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CheckIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel" arrow>
                      <IconButton
                        size="small"
                        onClick={cancelEdit}
                        disabled={isSaving}
                        aria-label="Cancel edit"
                        sx={{
                          padding: "4px",
                          color: "error.main",
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              }

              return (
                <Box
                  sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
                >
                  <Tooltip title="Open details" arrow>
                    <IconButton
                      className="mrt-action-btns"
                      size="small"
                      aria-label="Open"
                      onClick={() => handleOpen(orig)}
                      sx={{
                        padding: "4px",
                        color: "primary.main",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {canEdit && (
                    <Tooltip title="Edit user" arrow>
                      <IconButton
                        className="mrt-action-btns"
                        size="small"
                        aria-label="Edit"
                        onClick={() => startEdit(orig)}
                        sx={{
                          padding: "4px",
                          color: "secondary.main",
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              );
            },
          },
        ],
      },
      // Basic (moved photo + display name here)
      {
        header: "Basic",
        muiTableHeadCellProps: { sx: { textAlign: "left" } },
        columns: [
          {
            accessorKey: "student_name",
            header: "Student Name",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => {
              const orig = row.original as NormalizedUser;
              const isEditing = editingRowId === orig.id;
              const name =
                orig.student_name ??
                orig.display_name ??
                orig.name ??
                `User #${orig.id ?? "Unknown"}`;
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AvatarWithFallback
                    src={orig.photo_url}
                    name={name}
                    onClick={() => {
                      // open avatar dialog (implemented below)
                      openAvatar(orig, name as string);
                    }}
                    size={DEFAULT_AVATAR_SIZE}
                  />
                  <EditableCell
                    value={isEditing ? editedData.student_name : name}
                    isEditing={isEditing}
                    onChange={(val) => handleFieldChange("student_name", val)}
                    field="student_name"
                    placeholder="Student name"
                  />
                </Box>
              );
            },
          },
          // display_name removed; mapped to student_name during normalization
          {
            accessorKey: "father_name",
            header: "Father Name",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => {
              const orig = row.original as NormalizedUser;
              const isEditing = editingRowId === orig.id;
              return (
                <EditableCell
                  value={isEditing ? editedData.father_name : orig.father_name}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("father_name", val)}
                  field="father_name"
                  placeholder="Father name"
                />
              );
            },
          },
          {
            accessorKey: "gender",
            header: "Gender",
            size: 150,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => {
              const orig = row.original as NormalizedUser;
              const isEditing = editingRowId === orig.id;
              return (
                <EditableCell
                  value={isEditing ? editedData.gender : orig.gender}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("gender", val)}
                  field="gender"
                  placeholder="Gender"
                />
              );
            },
          },
        ],
      },
      // Contact Details (reordered)
      {
        header: "Contact Details",
        muiTableHeadCellProps: { sx: { textAlign: "left" } },
        columns: [
          {
            accessorKey: "phone",
            header: "Phone 1",
            size: 150,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => {
              const orig = row.original as NormalizedUser;
              const isEditing = editingRowId === orig.id;
              const phone = orig.phone || "";
              return (
                <EditableCell
                  value={isEditing ? editedData.phone : phone}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("phone", val)}
                  field="phone"
                  placeholder="Phone"
                />
              );
            },
          },
          {
            accessorKey: "email",
            header: "Email",
            size: 240,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => {
              const orig = row.original as NormalizedUser;
              const isEditing = editingRowId === orig.id;
              const email = orig.email || "";
              return (
                <EditableCell
                  value={isEditing ? editedData.email : email}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("email", val)}
                  field="email"
                  placeholder="Email"
                />
              );
            },
          },
          {
            accessorKey: "city",
            header: "City",
            size: 140,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => {
              const orig = row.original as NormalizedUser;
              const isEditing = editingRowId === orig.id;
              const city = orig.city || "";
              return (
                <EditableCell
                  value={isEditing ? editedData.city : city}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("city", val)}
                  field="city"
                  placeholder="City"
                />
              );
            },
          },
          {
            accessorKey: "state",
            header: "State",
            size: 160,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => {
              const orig = row.original as NormalizedUser;
              const isEditing = editingRowId === orig.id;
              const state = orig.state || "";
              return (
                <EditableCell
                  value={isEditing ? editedData.state : state}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("state", val)}
                  field="state"
                  placeholder="State"
                />
              );
            },
          },
          {
            accessorKey: "country",
            header: "Country",
            size: 160,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => (
              <ContactFieldCell original={row.original} field="country" />
            ),
          },
          {
            accessorKey: "zip_code",
            header: "Zip Code",
            size: 150,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => (
              <ContactFieldCell original={row.original} field="zip_code" />
            ),
          },
        ],
      },
      // Account Details (use the fields you specified)
      {
        header: "Account Details",
        muiTableHeadCellProps: { sx: { textAlign: "left" } },
        columns: [
          {
            accessorKey: "account_type",
            header: "Account Type",
            size: 150,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "providers",
            header: "Providers",
            size: 180,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => <ProvidersCell original={row.original} />,
          },
          {
            accessorKey: "firebase_uid",
            header: "Firebase UID",
            size: 240,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "phone_auth_used",
            header: "Phone Auth",
            size: 170,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => (
              <BoolCell
                value={(row.original as NormalizedUser).phone_auth_used}
                label="Phone Auth"
              />
            ),
          },
          {
            accessorKey: "created_at",
            header: "Created At",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => (
              <DateCell value={(row.original as NormalizedUser).created_at} />
            ),
          },
          {
            accessorKey: "last_sign_in",
            header: "Last Sign In",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => (
              <DateCell value={(row.original as NormalizedUser).last_sign_in} />
            ),
          },
        ],
      },
      // Application Details
      {
        header: "Application Details",
        muiTableHeadCellProps: { sx: { textAlign: "left" } },
        columns: [
          {
            accessorKey: "application_submitted",
            header: "App Submitted",
            size: 190,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => (
              <BoolCell
                value={(row.original as NormalizedUser).application_submitted}
                label="Application Submitted"
              />
            ),
          },
          {
            accessorKey: "app_submitted_date_time",
            header: "App Submitted at",
            size: 220,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "application_admin_approval",
            header: "Admin Approval",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "approved_at",
            header: "Approved At",
            size: 180,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "approved_by",
            header: "Approved By",
            size: 180,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "email_status",
            header: "Email Status",
            size: 180,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "email_sent_at",
            header: "Email Sent At",
            size: 180,
            muiFilterTextFieldProps: defaultFilterProps,
          },
        ],
      },
      // Admin Filled
      {
        header: "Admin Filled",
        muiTableHeadCellProps: { sx: { textAlign: "left" } },
        columns: [
          {
            accessorKey: "final_course_Name",
            header: "Final Course Name",
            size: 220,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "course_duration",
            header: "Course Duration",
            size: 220,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "payment_options",
            header: "Payment Options",
            size: 220,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "total_course_fees",
            header: "Total Course Fees",
            size: 220,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "first_installment_amount",
            header: "Installment 1",
            size: 190,
            muiFilterTextFieldProps: defaultFilterProps,
            muiTableBodyCellProps: {
              sx: {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            },
          },
          {
            accessorKey: "second_installment_amount",
            header: "Installment 2",
            size: 190,
            muiFilterTextFieldProps: defaultFilterProps,
            muiTableBodyCellProps: {
              sx: {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            },
          },
          {
            accessorKey: "second_installment_date",
            header: "Installment 2 Date",
            size: 220,
            muiFilterTextFieldProps: defaultFilterProps,
            muiTableBodyCellProps: {
              sx: {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            },
          },
          {
            accessorKey: "final_fee_payment_amount",
            header: "Fee Final Amt",
            size: 180,
            muiFilterTextFieldProps: defaultFilterProps,
            muiTableBodyCellProps: {
              sx: {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            },
          },
          {
            accessorKey: "remaining_fees",
            header: "Remaining Fees",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "discount",
            header: "Discount",
            size: 160,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "will_study_next_year",
            header: "Will Study NY",
            size: 190,
            muiFilterTextFieldProps: defaultFilterProps,
            muiTableBodyCellProps: {
              sx: {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            },
          },
          {
            accessorKey: "nata_attempt_year",
            header: "NATA Attempt Year",
            size: 220,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "offer_before_date",
            header: "Offer Before",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "admin_comment",
            header: "Admin Comment",
            size: 260,
            muiFilterTextFieldProps: defaultFilterProps,
          },
        ],
      },
      // Final Fee Payment Details
      {
        header: "Final Fee Payment Details",
        muiTableHeadCellProps: { sx: { textAlign: "left" } },
        columns: [
          {
            accessorKey: "payment_status",
            header: "Payment Status",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "payment_method",
            header: "Payment Method",
            size: 220,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "payment_at",
            header: "Payment At",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "payment_id",
            header: "Payment ID",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "order_id",
            header: "Order ID",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "amount",
            header: "Amount",
            size: 100,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "currency",
            header: "Currency",
            size: 180,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "upi_id",
            header: "UPI ID",
            size: 140,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "bank",
            header: "Bank",
            size: 160,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "contact",
            header: "Contact",
            size: 160,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => <ContactCell original={row.original} />,
          },
          {
            accessorKey: "receipt",
            header: "Receipt",
            size: 180,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "verified",
            header: "Verified",
            size: 10,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "signature",
            header: "Signature",
            size: 170,
            muiFilterTextFieldProps: defaultFilterProps,
          },
          {
            accessorKey: "installment_type",
            header: "Installment Type",
            size: 140,
            muiFilterTextFieldProps: defaultFilterProps,
          },
        ],
      },
    ],
    [editingRowId, editedData, canEdit, updateUserMutation.isPending]
  );

  return (
    <Box className="web-users-grid-root">
      {/* Role filter control */}
      {/* role filter removed per request */}
      {/* Show a non-blocking Snackbar with the error message when a fetch fails.
          We also keep a Retry button so users can trigger a refetch. */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={(_e, reason) => {
          if (reason === "clickaway") return;
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          action={
            <>
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  refetch();
                  setSnackbarOpen(false);
                }}
              >
                Retry
              </Button>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => setSnackbarOpen(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
          sx={{ width: "100%" }}
        >
          {error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : "Unknown error"}
        </Alert>
      </Snackbar>
      {/* Show a non-blocking warning if some rows were skipped due to malformed data */}
      <Snackbar
        open={validationSnackbarOpen}
        autoHideDuration={8000}
        onClose={(_e, reason) => {
          if (reason === "clickaway") return;
          setValidationSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          action={
            <>
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  // simply dismiss; developer console contains details
                  setValidationSnackbarOpen(false);
                }}
              >
                Dismiss
              </Button>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => setValidationSnackbarOpen(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
          sx={{ width: "100%" }}
        >
          {validationErrorsCount > 0
            ? `${validationErrorsCount} row(s) contained malformed data and were skipped.`
            : null}
        </Alert>
      </Snackbar>

      {/* Save/Error Snackbar for edit operations */}
      <Snackbar
        open={saveSnackbar.open}
        autoHideDuration={4000}
        onClose={() => setSaveSnackbar({ ...saveSnackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSaveSnackbar({ ...saveSnackbar, open: false })}
          severity={saveSnackbar.severity}
          sx={{ width: "100%" }}
        >
          {saveSnackbar.message}
        </Alert>
      </Snackbar>

      <ThemeProvider theme={mrtTheme}>
        <CssBaseline />
        <MaterialReactTable
          {...mrtTableProps}
          columns={columns}
          data={filteredRows}
          muiSearchTextFieldProps={{
            placeholder: "Search...",
            size: "small",
            variant: "outlined",
            label: undefined,
          }}
          enableColumnResizing={true}
          enableColumnOrdering
          enableColumnPinning
          enableStickyHeader
          enableDensityToggle={false}
          enableFullScreenToggle
          enableGlobalFilter
          enableColumnFilters
          initialState={{
            density: "compact",
            showGlobalFilter: true,
            showColumnFilters: true,
            columnPinning: { left: ["actions"] },
          }}
          muiTableContainerProps={{
            sx: { maxHeight: `calc(100vh - ${TABLE_CONTAINER_OFFSET_PX}px)` },
          }}
          state={{
            isLoading: isLoading && rows.length === 0,
            showProgressBars: isRefetching,
            pagination,
          }}
          manualPagination
          rowCount={rowCount}
          onPaginationChange={setPagination}
          muiPaginationProps={{
            rowsPerPageOptions: [25, 50, 100, 200],
            showFirstButton: true,
            showLastButton: true,
          }}
        />
        {/* Avatar preview dialog */}
        <Dialog
          open={avatarDialogOpen}
          onClose={closeAvatar}
          maxWidth="sm"
          fullWidth
          aria-labelledby="avatar-dialog-title"
        >
          <DialogTitle
            id="avatar-dialog-title"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Box sx={{ flex: 1 }}>{avatarDialogName ?? "User"}</Box>
            <IconButton aria-label="close" onClick={closeAvatar} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{ display: "flex", justifyContent: "center" }}
          >
            {avatarDialogSrc ? (
              <Box
                component="img"
                src={avatarDialogSrc}
                alt={avatarDialogName ?? "avatar"}
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
      </ThemeProvider>
    </Box>
  );
};

// Wrap the grid with an ErrorBoundary so rendering errors show a friendly fallback
export default function WebUsersGridWithBoundary() {
  return (
    <ErrorBoundary>
      <WebUsersGrid />
    </ErrorBoundary>
  );
}
