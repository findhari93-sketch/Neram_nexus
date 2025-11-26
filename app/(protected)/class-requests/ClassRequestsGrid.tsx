"use client";
import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableState,
} from "material-react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logger } from "@/lib/utils/logger";
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
  Skeleton,
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
import DeleteIcon from "@mui/icons-material/Delete";
import { z } from "zod";
import mrtTheme, { mrtTableProps } from "../mrtTheme";

// Extended table state interface for type safety
interface ExtendedTableState extends MRT_TableState<NormalizedClassRequest> {
  editingRowId?: string | number | null;
  editedData?: Partial<NormalizedClassRequest>;
}

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
            <ClearIcon fontSize="small" />
          </IconButton>
        </InputAdornment>
      ) : undefined,
    },
  } as any;
};
import ErrorBoundary from "./ErrorBoundary";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  AvatarWithFallback,
  AdminApprovalCell,
  ContactFieldCell,
  DateCell,
  BoolCell,
  EditableCell,
  ProvidersCell,
  ContactCell,
  DEFAULT_AVATAR_SIZE,
} from "../shared/GridComponents";
import {
  normalizeAccount,
  normalizeBasic,
  normalizeContact,
  normalizeApplication,
  normalizeProviders,
  sanitizeEditedFields,
  EditDataSchema,
  EDITABLE_FIELDS,
} from "../shared/gridUtils";

// Normalized user type for the grid (builds on the Supabase row type)
interface NormalizedClassRequest extends Record<string, unknown> {
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

// File-specific Zod schemas (keep only those not in shared files)
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
const NormalizedClassRequestSchema = z
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
const DEFAULT_PAGE_SIZE = 50;
const TABLE_CONTAINER_OFFSET_PX = 280; // used in `calc(100vh - ${TABLE_CONTAINER_OFFSET_PX}px)`

// AvatarWithFallback: resolves image URL from multiple row locations (top-level, account containers,
// JSON strings) and falls back to initials if image fails to load or is unavailable.
function resolvePhotoFromRow(orig: any): string | undefined {
  if (!orig) return undefined;

  // Helper to get Supabase Storage URL from avatar_path
  const getSupabaseStorageUrl = (
    avatarPath: string | null | undefined
  ): string | undefined => {
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

// Memoized small cell components are now imported from shared/GridComponents.tsx
// Keep only file-specific helpers and normalizers below

// File-specific normalization functions (Education, AdminFilled)
// (These are not in shared gridUtils.ts)

// parseMaybeJson helper (file-specific version for Education/AdminFilled schemas)
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

// File-specific cell components removed (now imported from shared)
// Removed: ProvidersCell, ContactCell, ContactFieldCell, DateCell, BoolCell, AdminApprovalCell, EditableCell

const _placeholder_removed_components = null; // placeholder to maintain line spacing

// normalizeEducation - file-specific (not in shared)
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

// normalizeAdminFilled - file-specific (not in shared)
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

// Hook to get current user's role from auth system
// TODO: Replace this with actual auth logic from your Supabase auth or session provider
const useCurrentUserRole = (): string | null => {
  // For now, returning "admin" for testing
  // In production, fetch from: supabase.auth.getUser() or your session/context
  return "admin"; // Change this to fetch real role: "admin" | "super_admin" | "teacher" | "student" | null
};

const ClassRequestsGrid: React.FC = () => {
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
    queryKey: [
      "submitted_applications",
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: async () => {
      const start = pagination.pageIndex * pagination.pageSize;
      const end = start + pagination.pageSize - 1;

      // Query the submitted_applications view which filters for submitted apps
      // and provides a reliable application_submitted_computed boolean column.
      // This gives us accurate server-side filtering and counts without brittle
      // PostgREST JSON syntax.
      const {
        data: rawData,
        error: queryError,
        count: supCount,
      } = await supabase
        .from("submitted_applications")
        .select("*", { count: "exact" })
        .order("id", { ascending: false })
        .range(start, end);

      if (queryError) throw new Error(queryError.message);

      // Normalize rows: flatten commonly-used nested JSON columns (account/contact)
      const raw = (rawData as RawRow[]) ?? [];
      const normalized: NormalizedClassRequest[] = raw.map((r) => {
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

        return out as NormalizedClassRequest;
      });

      // Lenient validation: attempt to parse but never skip rows. If parsing
      // fails, keep the original normalized row and log a dev-only warning.
      const finalRows: NormalizedClassRequest[] = [];
      let validationErrors = 0;
      for (const nr of normalized) {
        const res = NormalizedClassRequestSchema.safeParse(nr);
        if (res.success) {
          finalRows.push(res.data as NormalizedClassRequest);
        } else {
          validationErrors++;
          if (process.env.NODE_ENV === "development") {
            logger.validationError(validationErrors, {
              row: nr,
              issues: res.error.issues,
            });
          }
          finalRows.push(nr as NormalizedClassRequest);
        }
      }

      // The view already filters for submitted applications, so return all rows
      return {
        rows: finalRows,
        rowCount: supCount ?? finalRows.length,
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
  const [editingRowId, setEditingRowId] = useState<string | number | null>(
    null
  );
  const [editedData, setEditedData] = useState<Partial<NormalizedClassRequest>>(
    {}
  );

  // Validation errors for inline display
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Track unsaved changes for warning
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useEffect(() => {
    setHasUnsavedChanges(editingRowId !== null);
  }, [editingRowId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Save/error snackbars for edit operations
  const [saveSnackbar, setSaveSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] =
    useState<NormalizedClassRequest | null>(null);

  const openAvatar = (orig: NormalizedClassRequest, name?: string) => {
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
          "submitted_applications",
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
      logger.error("Update failed", error);
      setSaveSnackbar({
        open: true,
        message: `Failed to update user: ${error.message || "Unknown error"}`,
        severity: "error",
      });
    },
  });

  // Mutation to delete request from Supabase
  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase
        .from("users_duplicate")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      // Invalidate and refetch the request list
      queryClient.invalidateQueries({
        queryKey: [
          "submitted_applications",
          pagination.pageIndex,
          pagination.pageSize,
        ],
      });
      setSaveSnackbar({
        open: true,
        message: "Request deleted successfully!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    },
    onError: (error: any) => {
      logger.error("Delete failed", error);
      setSaveSnackbar({
        open: true,
        message: `Failed to delete request: ${
          error.message || "Unknown error"
        }`,
        severity: "error",
      });
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    },
  });

  // Action handlers for row action buttons
  const handleOpen = useCallback((orig: NormalizedClassRequest) => {
    const id = orig.id ?? orig.firebase_uid;
    if (id) {
      router.push(`/class-requests/${String(id)}`);
    }
  }, [router]);

  const startEdit = useCallback((orig: NormalizedClassRequest) => {
    if (!canEdit || !orig.id) return;
    setEditingRowId(orig.id);
    // Reset edited data; fields will be tracked as user changes them
    setEditedData({});
  }, [canEdit]);

  const saveEdit = useCallback(async () => {
    if (editingRowId === null) {
      console.log(
        "[ClassRequestsGrid] saveEdit called but no editingRowId set"
      );
      return;
    }

    console.log("[ClassRequestsGrid] saveEdit start", {
      editingRowId,
      editedData,
    });

    const sanitizedData = sanitizeEditedFields(editedData);
    console.log("[ClassRequestsGrid] sanitizedData", sanitizedData);

    if (Object.keys(sanitizedData).length === 0) {
      setSaveSnackbar({
        open: true,
        message: "No changes to save",
        severity: "info",
      });
      console.log("[ClassRequestsGrid] no-op save: no changes");
      return;
    }

    // Validate edited data before saving
    const validation = EditDataSchema.safeParse(sanitizedData);
    if (!validation.success) {
      console.warn(
        "[ClassRequestsGrid] validation failed",
        validation.error.issues
      );
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setValidationErrors(errors);
      setSaveSnackbar({
        open: true,
        message: validation.error.issues[0].message,
        severity: "error",
      });
      return;
    }

    setValidationErrors({});

    // Map flat fields to JSONB structure based on database schema
    const updateData: any = {};

    // Fields that go into 'basic' JSONB column
    const basicFields: any = {};
    if ("student_name" in sanitizedData)
      basicFields.student_name = sanitizedData.student_name;
    if ("father_name" in sanitizedData)
      basicFields.father_name = sanitizedData.father_name;
    if ("gender" in sanitizedData) basicFields.gender = sanitizedData.gender;
    if ("dob" in sanitizedData) basicFields.dob = sanitizedData.dob;

    if (Object.keys(basicFields).length > 0) {
      updateData.basic = basicFields;
    }

    // Fields that go into 'contact' JSONB column
    const contactFields: any = {};
    if ("email" in sanitizedData) contactFields.email = sanitizedData.email;
    if ("phone" in sanitizedData) contactFields.phone = sanitizedData.phone;
    if ("city" in sanitizedData) contactFields.city = sanitizedData.city;
    if ("state" in sanitizedData) contactFields.state = sanitizedData.state;
    if ("country" in sanitizedData)
      contactFields.country = sanitizedData.country;
    if ("zip_code" in sanitizedData)
      contactFields.zip_code = sanitizedData.zip_code;

    if (Object.keys(contactFields).length > 0) {
      updateData.contact = contactFields;
    }

    setSaveSnackbar({ open: true, message: "Saving...", severity: "info" });
    console.log("[ClassRequestsGrid] mutate update", {
      id: editingRowId,
      updateData,
    });
    updateUserMutation.mutate({ id: editingRowId, data: updateData });
  }, [editingRowId, editedData, updateUserMutation]);

  const cancelEdit = useCallback(() => {
    // Confirm before discarding changes if user has made edits
    if (editingRowId !== null && Object.keys(editedData).length > 0) {
      if (!confirm("Discard unsaved changes?")) {
        return;
      }
    }

    setEditingRowId(null);
    setEditedData({});
    setValidationErrors({});
  }, [editingRowId, editedData]);

  const handleFieldChange = useCallback((
    field: keyof NormalizedClassRequest,
    value: any
  ) => {
    if (!EDITABLE_FIELDS.includes(field as any)) return;
    setEditedData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleEdit = (orig: NormalizedClassRequest) => {
    if (!canEdit) {
      alert("You don't have permission to edit this row");
      return;
    }
    startEdit(orig);
  };

  // Delete handlers
  const openDeleteDialog = useCallback((orig: NormalizedClassRequest) => {
    setRequestToDelete(orig);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (requestToDelete?.id) {
      deleteRequestMutation.mutate(requestToDelete.id);
    }
  }, [requestToDelete, deleteRequestMutation]);

  const columns = useMemo<MRT_ColumnDef<NormalizedClassRequest>[]>(
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
            Cell: ({ row, table }) => {
              const orig = row.original as NormalizedClassRequest;
              const tableState = table.getState() as ExtendedTableState;
              const isEditing = tableState?.editingRowId === orig.id;
              const isSaving =
                updateUserMutation.isPending &&
                tableState?.editingRowId === orig.id;

              if (isEditing) {
                const hasChanges =
                  !!tableState?.editedData &&
                  Object.keys(tableState.editedData as object).length > 0;
                return (
                  <Box
                    sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
                  >
                    <Tooltip
                      title={hasChanges ? "Save changes" : "No changes to save"}
                      arrow
                    >
                      <IconButton
                        size="small"
                        onClick={saveEdit}
                        disabled={isSaving || !hasChanges}
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
                      aria-label="Open request details"
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
                    <>
                      <Tooltip title="Edit user" arrow>
                        <IconButton
                          className="mrt-action-btns"
                          size="small"
                          aria-label="Edit request"
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
                      <Tooltip title="Delete request" arrow>
                        <IconButton
                          className="mrt-action-btns"
                          size="small"
                          aria-label="Delete request"
                          onClick={() => openDeleteDialog(orig)}
                          sx={{
                            padding: "4px",
                            color: "error.main",
                            "&:hover": { backgroundColor: "action.hover" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
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
            Cell: ({ row, table }) => {
              const orig = row.original as NormalizedClassRequest;
              const tableState = table.getState() as ExtendedTableState;
              const isEditing = tableState?.editingRowId === orig.id;
              const editedData = tableState?.editedData || {};
              const name =
                orig.student_name ??
                orig.display_name ??
                orig.name ??
                `User #${orig.id ?? "Unknown"}`;

              // Resolve photo URL from all possible sources (account.photo_url, account.avatar_path, etc.)
              const photoUrl =
                resolvePhotoFromRow(orig) ??
                (orig.photo_url as string | undefined);

              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AvatarWithFallback
                    src={photoUrl}
                    name={name}
                    userId={orig.id}
                    onClick={() => {
                      // open avatar dialog (implemented below)
                      openAvatar(orig, name as string);
                    }}
                    size={DEFAULT_AVATAR_SIZE}
                  />
                  <EditableCell
                    value={
                      isEditing
                        ? (editedData as any).student_name ??
                          orig.student_name ??
                          name
                        : name
                    }
                    isEditing={isEditing}
                    onChange={(val) => handleFieldChange("student_name", val)}
                    field="student_name"
                    placeholder="Student name"
                    error={validationErrors.student_name}
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
            Cell: ({ row, table }) => {
              const orig = row.original as NormalizedClassRequest;
              const tableState = table.getState() as ExtendedTableState;
              const isEditing = tableState?.editingRowId === orig.id;
              const editedData = tableState?.editedData || {};
              return (
                <EditableCell
                  value={
                    isEditing
                      ? (editedData as any).father_name ??
                        orig.father_name ??
                        ""
                      : orig.father_name
                  }
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("father_name", val)}
                  field="father_name"
                  placeholder="Father name"
                  error={validationErrors.father_name}
                />
              );
            },
          },
          {
            accessorKey: "gender",
            header: "Gender",
            size: 150,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row, table }) => {
              const orig = row.original as NormalizedClassRequest;
              const tableState = table.getState() as ExtendedTableState;
              const isEditing = tableState?.editingRowId === orig.id;
              const editedData = tableState?.editedData || {};
              return (
                <EditableCell
                  value={
                    isEditing
                      ? (editedData as any).gender ?? orig.gender ?? ""
                      : orig.gender
                  }
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("gender", val)}
                  field="gender"
                  placeholder="Gender"
                  error={validationErrors.gender}
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
            Cell: ({ row, table }) => {
              const orig = row.original as NormalizedClassRequest;
              const tableState = table.getState() as ExtendedTableState;
              const isEditing = tableState?.editingRowId === orig.id;
              const editedData = tableState?.editedData || {};
              const phone = orig.phone || "";
              return (
                <EditableCell
                  value={isEditing ? (editedData as any).phone ?? phone : phone}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("phone", val)}
                  field="phone"
                  placeholder="Phone"
                  error={validationErrors.phone}
                />
              );
            },
          },
          {
            accessorKey: "email",
            header: "Email",
            size: 240,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row, table }) => {
              const orig = row.original as NormalizedClassRequest;
              const tableState = table.getState() as ExtendedTableState;
              const isEditing = tableState?.editingRowId === orig.id;
              const editedData = tableState?.editedData || {};
              const email = orig.email || "";
              return (
                <EditableCell
                  value={isEditing ? (editedData as any).email ?? email : email}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("email", val)}
                  field="email"
                  placeholder="Email"
                  error={validationErrors.email}
                />
              );
            },
          },
          {
            accessorKey: "city",
            header: "City",
            size: 140,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row, table }) => {
              const orig = row.original as NormalizedClassRequest;
              const tableState = table.getState() as ExtendedTableState;
              const isEditing = tableState?.editingRowId === orig.id;
              const editedData = tableState?.editedData || {};
              const city = orig.city || "";
              return (
                <EditableCell
                  value={isEditing ? (editedData as any).city ?? city : city}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("city", val)}
                  field="city"
                  placeholder="City"
                  error={validationErrors.city}
                />
              );
            },
          },
          {
            accessorKey: "state",
            header: "State",
            size: 160,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row, table }) => {
              const orig = row.original as NormalizedClassRequest;
              const tableState = table.getState() as ExtendedTableState;
              const isEditing = tableState?.editingRowId === orig.id;
              const editedData = tableState?.editedData || {};
              const state = orig.state || "";
              return (
                <EditableCell
                  value={isEditing ? (editedData as any).state ?? state : state}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("state", val)}
                  field="state"
                  placeholder="State"
                  error={validationErrors.state}
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
                value={(row.original as NormalizedClassRequest).phone_auth_used}
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
              <DateCell
                value={(row.original as NormalizedClassRequest).created_at}
              />
            ),
          },
          {
            accessorKey: "last_sign_in",
            header: "Last Sign In",
            size: 200,
            muiFilterTextFieldProps: defaultFilterProps,
            Cell: ({ row }) => (
              <DateCell
                value={(row.original as NormalizedClassRequest).last_sign_in}
              />
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
                value={
                  (row.original as NormalizedClassRequest).application_submitted
                }
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
            Cell: ({ row }) => (
              <AdminApprovalCell original={row.original as NormalizedClassRequest} />
            ),
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
    [canEdit, saveEdit, cancelEdit, handleFieldChange, validationErrors, handleOpen, startEdit, openDeleteDialog] // Include all functions and state used in columns
  );

  return (
    <Box className="web-users-grid-root">
      {/* Skeleton loading state for initial load */}
      {isLoading && rows.length === 0 && (
        <Box sx={{ p: 2 }}>
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} height={56} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      )}

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
          muiTableBodyRowProps={({ row, table }) => {
            const tableState = table.getState() as ExtendedTableState;
            const isEditing = tableState?.editingRowId === row.original.id;

            return {
              sx: {
                bgcolor: isEditing ? "rgba(25, 118, 210, 0.08)" : "transparent",
                "&:hover": {
                  bgcolor: isEditing ? "rgba(25, 118, 210, 0.12)" : undefined,
                },
              },
            };
          }}
          renderEmptyRowsFallback={() => (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No class requests found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isLoading
                  ? "Loading requests..."
                  : "Try adjusting your search or filters"}
              </Typography>
            </Box>
          )}
          initialState={{
            density: "compact",
            showGlobalFilter: true,
            showColumnFilters: true,
            columnPinning: { left: ["actions"] },
            sorting: [{ id: "created_at", desc: true }],
          }}
          muiTableContainerProps={{
            sx: { maxHeight: `calc(100vh - ${TABLE_CONTAINER_OFFSET_PX}px)` },
          }}
          state={
            {
              isLoading: isLoading && rows.length === 0,
              showProgressBars: isRefetching,
              pagination,
              // Custom state for tracking editing (always include)
              editingRowId,
              editedData,
            } as any
          }
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

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !deleteRequestMutation.isPending) {
              e.preventDefault();
              confirmDelete();
            }
          }}
          maxWidth="xs"
          fullWidth
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle
            id="delete-dialog-title"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <DeleteIcon sx={{ color: "error.main" }} />
            <Box sx={{ flex: 1 }}>Confirm Delete</Box>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
              Press Enter to confirm, Esc to cancel
            </Typography>
            <IconButton
              aria-label="close"
              onClick={closeDeleteDialog}
              size="small"
              disabled={deleteRequestMutation.isPending}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete the request for{" "}
              <strong>
                {requestToDelete?.student_name ??
                  requestToDelete?.display_name ??
                  requestToDelete?.name ??
                  `User #${requestToDelete?.id ?? "Unknown"}`}
              </strong>
              ?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This action cannot be undone. The request data will be permanently
              removed from the database.
            </Typography>
          </DialogContent>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              p: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={closeDeleteDialog}
              disabled={deleteRequestMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDelete}
              disabled={deleteRequestMutation.isPending}
              startIcon={
                deleteRequestMutation.isPending ? (
                  <CircularProgress size={16} />
                ) : (
                  <DeleteIcon />
                )
              }
            >
              {deleteRequestMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </Box>
        </Dialog>
      </ThemeProvider>
    </Box>
  );
};

// Wrap the grid with an ErrorBoundary so rendering errors show a friendly fallback
export default function ClassRequestsGridWithBoundary() {
  return (
    <ErrorBoundary>
      <ClassRequestsGrid />
    </ErrorBoundary>
  );
}
