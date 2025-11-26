import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Avatar,
  Chip,
  Checkbox,
  TextField,
  CircularProgress,
} from "@mui/material";

// Default avatar size for grids
export const DEFAULT_AVATAR_SIZE = 24;

// Types for the normalized user/request data
export interface BaseNormalizedData extends Record<string, unknown> {
  id?: string | number;
  photo_url?: string | null;
  student_name?: string | null;
  display_name?: string | null;
  name?: string | null;
  providers?: unknown;
  contact?: unknown;
  application_submitted?: boolean;
  application_admin_approval?: unknown;
  city?: string;
  email?: string;
  phone?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

// AvatarWithFallback: consistent solid color avatars with photo loading state.
export const AvatarWithFallback: React.FC<{
  src?: string | null;
  name?: string | null;
  userId?: string | number;
  size?: number;
  onClick?: () => void;
}> = React.memo(
  ({ src, name, userId, size = DEFAULT_AVATAR_SIZE, onClick }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    useEffect(() => {
      setImgFailed(false);
      setImgLoaded(false);
    }, [src]);

    const initials = useMemo(() => {
      if (!name) return "?";
      return name
        .split(" ")
        .filter(Boolean)
        .map((s: string) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }, [name]);

    const finalSrc = useMemo(() => {
      if (!src || typeof src !== "string") return null;
      const trimmed = src.trim();
      if (!trimmed) return null;
      if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        return null;
      }
      return trimmed.replace(/^http:\/\//i, "https://");
    }, [src]);

    const colorPalette = useMemo(
      () => [
        "#1976d2",
        "#388e3c",
        "#d32f2f",
        "#7b1fa2",
        "#f57c00",
        "#0097a7",
        "#c2185b",
        "#5d4037",
        "#455a64",
        "#e64a19",
      ],
      []
    );

    const backgroundColor = useMemo(() => {
      const seed = userId ? String(userId) : name || "default";
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
      }
      return colorPalette[Math.abs(hash) % colorPalette.length];
    }, [userId, name, colorPalette]);

    const showPlaceholder = !finalSrc || imgFailed || !imgLoaded;

    return (
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <Avatar
          src={!imgFailed && finalSrc ? finalSrc : undefined}
          alt={name || "User"}
          onClick={onClick}
          sx={{
            width: size,
            height: size,
            bgcolor: backgroundColor,
            color: "#ffffff",
            fontWeight: 600,
            fontSize: size * 0.4,
            cursor: onClick ? "pointer" : "default",
            transition: "all 0.2s ease",
            "&:hover": onClick
              ? {
                  transform: "scale(1.05)",
                  boxShadow: 2,
                }
              : undefined,
          }}
          imgProps={{
            referrerPolicy: "no-referrer",
            loading: "lazy",
            onLoad: () => {
              if (mountedRef.current) {
                setImgLoaded(true);
              }
            },
            onError: () => {
              if (mountedRef.current) {
                setImgFailed(true);
              }
            },
          }}
        >
          {showPlaceholder ? initials : null}
        </Avatar>
        {finalSrc && !imgLoaded && !imgFailed && (
          <CircularProgress
            size={size * 0.5}
            thickness={4}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: `-${size * 0.25}px`,
              marginLeft: `-${size * 0.25}px`,
              color: "rgba(255, 255, 255, 0.8)",
            }}
          />
        )}
      </Box>
    );
  }
);

AvatarWithFallback.displayName = "AvatarWithFallback";

// Admin Approval cell component that shows appropriate status based on submission
export const AdminApprovalCell: React.FC<{ original: BaseNormalizedData }> =
  React.memo(({ original }) => {
    const isSubmitted = Boolean(original.application_submitted);
    const approvalStatus = original.application_admin_approval;

    // If application not submitted, show "Not Submitted"
    if (!isSubmitted) {
      return (
        <Chip
          label="Not Submitted"
          size="small"
          sx={{
            bgcolor: "#f5f5f5",
            color: "#666",
            fontWeight: 500,
          }}
        />
      );
    }

    // If submitted, check the approval status
    const status = String(approvalStatus || "").toLowerCase();

    if (status === "approved") {
      return (
        <Chip
          label="Approved"
          size="small"
          sx={{
            bgcolor: "#4caf50",
            color: "#fff",
            fontWeight: 500,
          }}
        />
      );
    } else if (status === "rejected") {
      return (
        <Chip
          label="Rejected"
          size="small"
          sx={{
            bgcolor: "#f44336",
            color: "#fff",
            fontWeight: 500,
          }}
        />
      );
    } else {
      // Application submitted but not yet approved/rejected = Pending
      return (
        <Chip
          label="Pending"
          size="small"
          sx={{
            bgcolor: "#ff9800",
            color: "#fff",
            fontWeight: 500,
          }}
        />
      );
    }
  });

AdminApprovalCell.displayName = "AdminApprovalCell";

// Generic cell to render a single contact field
export const ContactFieldCell: React.FC<{
  original: BaseNormalizedData;
  field: "phone" | "email" | "city" | "state" | "country" | "zip_code";
}> = React.memo(({ original, field }) => {
  const getContactField = (
    orig: BaseNormalizedData,
    fld: string
  ): string | undefined => {
    const top = orig[fld as keyof BaseNormalizedData];
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

ContactFieldCell.displayName = "ContactFieldCell";

// Date cell component
export const DateCell: React.FC<{
  value?: string | number | Date | null | undefined;
}> = React.memo(({ value }) => {
  if (!value && value !== 0) return <></>;
  try {
    return <>{new Date(String(value)).toLocaleString()}</>;
  } catch {
    return <>{String(value)}</>;
  }
});

DateCell.displayName = "DateCell";

// Boolean cell component
export const BoolCell: React.FC<{ value?: boolean | any; label?: string }> =
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

BoolCell.displayName = "BoolCell";

// Editable cell component for inline editing
export const EditableCell: React.FC<{
  value: any;
  isEditing: boolean;
  onChange: (value: any) => void;
  field: string;
  placeholder?: string;
  error?: string;
}> = React.memo(
  ({ value, isEditing, onChange, field, placeholder, error }) => {
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
        error={!!error}
        helperText={error}
        sx={{
          "& .MuiOutlinedInput-root": {
            fontSize: "0.875rem",
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      />
    );
  }
);

EditableCell.displayName = "EditableCell";

// Providers cell component
export const ProvidersCell: React.FC<{ original: BaseNormalizedData }> =
  React.memo(({ original }) => {
    const v = original?.providers;
    try {
      if (Array.isArray(v)) return <>{String(v.join(", "))}</>;
      if (typeof v === "string") return <>{v}</>;
      return <></>;
    } catch {
      return <></>;
    }
  });

ProvidersCell.displayName = "ProvidersCell";

// Contact cell component (displays first available contact field)
export const ContactCell: React.FC<{ original: BaseNormalizedData }> =
  React.memo(({ original }) => {
    // Prefer top-level normalized fields when available
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
  });

ContactCell.displayName = "ContactCell";
