/**
 * Reusable cell components for UserTable
 * Extracted from WebUsersGrid to improve maintainability
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Checkbox,
  Chip,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import type { NormalizedUser } from "@/hooks/useUserData";
import { extractNestedField } from "@/lib/utils/userNormalization";
import { logger } from "@/lib/utils/logger";
import {
  APPROVAL_STATUS,
  normalizeApprovalStatus,
} from "@/lib/constants/approvalStatus";

// Constants
const DEFAULT_AVATAR_SIZE = 24;

/**
 * Avatar component with fallback to initials
 * Handles image loading errors and CORS issues
 */
export const AvatarWithFallback: React.FC<{
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

    if (finalSrc) {
      logger.avatarReceived(name, finalSrc, finalSrc?.length);
    }

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

    const hashString = (str?: string | null): number => {
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

    const luminance = (hex: string): number => {
      const { r, g, b } = hexToRgb(hex);
      const srgb = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    };

    const avgL = (luminance(color1) + luminance(color2)) / 2;
    const textColor = avgL > 0.5 ? "#000000" : "#ffffff";

    const placeholderSx =
      placeholderVariant === "gradient"
        ? {
            backgroundImage: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
          }
        : { bgcolor: color1 };

    const showPlaceholder = !finalSrc || imgFailed;

    return (
      <Avatar
        src={finalSrc && !imgFailed ? finalSrc : undefined}
        alt={name ?? undefined}
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          color: textColor,
          fontWeight: 600,
          cursor: onClick ? "pointer" : "default",
          ...(showPlaceholder ? placeholderSx : {}),
        }}
        imgProps={{
          referrerPolicy: "no-referrer",
          loading: "lazy",
          onLoad: () => {
            if (mountedRef.current) {
              setImgLoaded(true);
              logger.avatarLoaded(name);
            }
          },
          onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
            if (mountedRef.current) {
              setImgFailed(true);
              logger.avatarFailed(name, finalSrc ?? "", e);
            }
          },
        }}
      >
        {showPlaceholder ? initials ?? null : null}
      </Avatar>
    );
  }
);

AvatarWithFallback.displayName = "AvatarWithFallback";

/**
 * Cell for displaying provider array
 */
export const ProvidersCell: React.FC<{ original: NormalizedUser }> = React.memo(
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

ProvidersCell.displayName = "ProvidersCell";

/**
 * Generic cell for contact fields (phone/email/city/state/country/zip)
 */
export const ContactFieldCell: React.FC<{
  original: NormalizedUser;
  field: "phone" | "email" | "city" | "state" | "country" | "zip_code";
}> = React.memo(({ original, field }) => {
  const value = extractNestedField<string>(
    original as Record<string, unknown>,
    ["contact", "contact_info"],
    [
      field,
      field === "zip_code" ? "zip" : field,
      field === "phone" ? "mobile" : field,
    ]
  );
  return <>{value ?? ""}</>;
});

ContactFieldCell.displayName = "ContactFieldCell";

/**
 * Cell for displaying dates in locale format
 */
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

/**
 * Cell for boolean values (renders checkbox)
 */
export const BoolCell: React.FC<{ value?: boolean | unknown; label?: string }> =
  React.memo(({ value, label }) => {
    const checked = Boolean(value);
    const ariaLabel = label
      ? `${label}: ${checked ? "yes" : "no"}`
      : `Value: ${checked ? "yes" : "no"}`;

    return (
      <Checkbox
        checked={checked}
        size="small"
        inputProps={{ "aria-label": ariaLabel, readOnly: true }}
        onChange={() => {}}
        title={ariaLabel}
      />
    );
  });

BoolCell.displayName = "BoolCell";

/**
 * Admin approval status chip
 */
export const AdminApprovalCell: React.FC<{ original: NormalizedUser }> =
  React.memo(({ original }) => {
    const isSubmitted = Boolean(original.application_submitted);
    const approvalStatus = normalizeApprovalStatus(
      original.application_admin_approval
    );

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

    if (approvalStatus === APPROVAL_STATUS.APPROVED) {
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
    } else if (approvalStatus === APPROVAL_STATUS.REJECTED) {
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

/**
 * Editable text field cell
 */
export const EditableCell: React.FC<{
  value: unknown;
  isEditing: boolean;
  onChange: (value: string) => void;
  field: keyof NormalizedUser;
  placeholder?: string;
}> = React.memo(({ value, isEditing, onChange, field, placeholder }) => {
  if (!isEditing) {
    return <span>{String(value || "—")}</span>;
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

EditableCell.displayName = "EditableCell";
