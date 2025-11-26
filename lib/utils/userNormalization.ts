/**
 * Generic JSONB field normalization utilities
 * Replaces duplicate normalization logic with type-safe, reusable functions
 */

import { z } from "zod";
import { logger } from "./logger";

// Type-safe parsed result (no 'any' types)
type ParseResult<T> = T | undefined;

/**
 * Parse a value that may be an object or JSON string
 * Returns typed result or undefined on failure
 */
export function parseMaybeJson<T = unknown>(
  value: unknown,
  schema?: z.ZodSchema<T>
): ParseResult<T> {
  if (value === null || value === undefined) {
    return undefined;
  }

  // Already an object
  if (typeof value === "object") {
    if (!schema) return value as T;
    const result = schema.safeParse(value);
    if (!result.success) {
      logParseError("Object validation failed", value, result.error);
      return undefined;
    }
    return result.data;
  }

  // Try parsing string as JSON
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    try {
      const parsed = JSON.parse(trimmed);
      if (!schema) return parsed as T;

      const result = schema.safeParse(parsed);
      if (!result.success) {
        logParseError("JSON validation failed", value, result.error);
        return undefined;
      }
      return result.data;
    } catch (error) {
      logParseError("JSON parse failed", value, error);
      return undefined;
    }
  }

  return undefined;
}

/**
 * Structured error logging (replaces silent catch blocks)
 * In production, this should send to error tracking service (Sentry, LogRocket)
 */
function logParseError(message: string, value: unknown, error: unknown): void {
  logger.normalizationError(message, {
    value: typeof value === "string" ? value.substring(0, 100) : value,
    error,
  });
}
/**
 * Generic field mapping configuration
 */
interface FieldMapping {
  /** Target field name in normalized output */
  target: string;
  /** Possible source field names (priority order) */
  sources: string[];
  /** Transform function to apply to value */
  transform?: (value: unknown) => unknown;
}

/**
 * Generic normalizer that extracts fields from nested JSONB containers
 * Replaces normalizeAccount, normalizeBasic, normalizeContact, etc.
 */
export function normalizeFields<TSource extends Record<string, unknown>>(
  source: TSource,
  target: Partial<Record<string, unknown>>,
  config: {
    /** Container field names to check (e.g., ["account", "account_details"]) */
    containerKeys: string[];
    /** Field mappings to apply */
    mappings: FieldMapping[];
    /** Optional schema for container validation */
    schema?: z.ZodSchema;
  }
): void {
  // Try to parse container from multiple possible locations
  let container: Record<string, unknown> | undefined;

  for (const key of config.containerKeys) {
    const rawValue = source[key];
    if (rawValue !== undefined && rawValue !== null) {
      const parsed = parseMaybeJson(rawValue, config.schema);
      if (parsed !== undefined) {
        container = parsed as Record<string, unknown>;
        break;
      }
    }
  }

  // Use source object as fallback if no container found
  const dataSource = container ?? source;

  // Apply field mappings
  for (const mapping of config.mappings) {
    // Skip if target already has a value
    if (target[mapping.target] !== undefined) continue;

    // Try each source in priority order
    for (const sourceKey of mapping.sources) {
      const value = dataSource[sourceKey];
      if (value !== undefined && value !== null) {
        target[mapping.target] = mapping.transform
          ? mapping.transform(value)
          : value;
        break;
      }
    }
  }
}

/**
 * Specialized normalizer for array fields (e.g., providers)
 */
export function normalizeArrayField(
  target: Partial<Record<string, unknown>>,
  fieldName: string
): void {
  const value = target[fieldName];
  if (value === undefined || value === null) return;

  // Already an array
  if (Array.isArray(value)) return;

  // Try parsing string as JSON
  if (typeof value === "string") {
    const parsed = parseMaybeJson<unknown[]>(value);
    if (parsed !== undefined) {
      target[fieldName] = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      logParseError(
        `Failed to parse array field: ${fieldName}`,
        value,
        new Error("Not an array")
      );
    }
  }
}

/**
 * Type-safe extractor for nested fields
 * Used by cell components to safely access contact/basic data
 */
export function extractNestedField<T = string>(
  source: Record<string, unknown>,
  containerKeys: string[],
  fieldKeys: string[]
): T | undefined {
  // Check top-level first
  for (const key of fieldKeys) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      return value as T;
    }
  }

  // Check nested containers
  for (const containerKey of containerKeys) {
    const container = source[containerKey];
    if (container === null || container === undefined) continue;

    const parsed =
      typeof container === "object"
        ? (container as Record<string, unknown>)
        : parseMaybeJson<Record<string, unknown>>(container);

    if (parsed) {
      for (const fieldKey of fieldKeys) {
        const value = parsed[fieldKey];
        if (value !== undefined && value !== null) {
          return value as T;
        }
      }
    }
  }

  return undefined;
}

/**
 * Pre-configured normalizers for common data types
 * These replace the individual normalize* functions
 */
export const accountNormalizer = {
  containerKeys: [
    "account",
    "account_details",
    "account_info",
    "auth",
    "provider_info",
  ],
  mappings: [
    {
      target: "photo_url",
      sources: [
        "photo_url",
        "photoUrl",
        "avatar",
        "image",
        "profile_image",
        "profilePhoto",
      ],
    },
    {
      target: "providers",
      sources: ["providers", "provider"],
    },
    {
      target: "created_at",
      sources: ["created_at", "createdAt"],
    },
    {
      target: "last_sign_in",
      sources: ["last_sign_in", "lastSignIn", "last_login"],
    },
    {
      target: "account_type",
      sources: ["account_type", "type"],
    },
    {
      target: "display_name",
      sources: ["display_name", "name"],
    },
    {
      target: "firebase_uid",
      sources: ["firebase_uid", "uid"],
    },
    {
      target: "phone_auth_used",
      sources: ["phone_auth_used", "phone_verified"],
      transform: (v: unknown) => Boolean(v),
    },
  ],
};

export const basicNormalizer = {
  containerKeys: ["basic", "basic_info"],
  mappings: [
    {
      target: "student_name",
      sources: ["student_name", "studentName", "name", "full_name"],
    },
    {
      target: "father_name",
      sources: ["father_name", "fatherName"],
    },
    {
      target: "gender",
      sources: ["gender", "sex"],
    },
    {
      target: "dob",
      sources: ["dob", "date_of_birth"],
    },
  ],
};

export const contactNormalizer = {
  containerKeys: ["contact", "contact_info"],
  mappings: [
    {
      target: "email",
      sources: ["email", "primary_email"],
    },
    {
      target: "phone",
      sources: ["phone", "mobile"],
    },
    {
      target: "city",
      sources: ["city"],
    },
    {
      target: "state",
      sources: ["state"],
    },
    {
      target: "country",
      sources: ["country"],
    },
    {
      target: "zip_code",
      sources: ["zip_code", "zip"],
    },
  ],
};

export const educationNormalizer = {
  containerKeys: ["education", "education_info"],
  mappings: [
    {
      target: "education_type",
      sources: ["education_type", "type"],
    },
    {
      target: "board",
      sources: ["board"],
    },
    {
      target: "board_year",
      sources: ["board_year"],
    },
    {
      target: "school_std",
      sources: ["school_std"],
    },
    {
      target: "diploma_course",
      sources: ["diploma_course"],
    },
    {
      target: "diploma_year",
      sources: ["diploma_year"],
    },
    {
      target: "school_name",
      sources: ["school_name"],
    },
  ],
};

export const applicationNormalizer = {
  containerKeys: [
    "application",
    "application_info",
    "application_details",
    "applicationDetails",
  ],
  mappings: [
    {
      target: "application_submitted",
      sources: ["application_submitted", "submitted", "is_submitted"],
      transform: (v: unknown) => Boolean(v),
    },
    {
      target: "app_submitted_date_time",
      sources: ["app_submitted_date_time", "submitted_at", "submittedAt"],
    },
    {
      target: "application_admin_approval",
      sources: ["application_admin_approval", "applicationAdminApproval"],
    },
    {
      target: "approved_at",
      sources: ["approved_at", "approvedAt"],
    },
    {
      target: "approved_by",
      sources: ["approved_by", "approvedBy"],
    },
    {
      target: "email_status",
      sources: ["email_status"],
    },
    {
      target: "email_sent_at",
      sources: ["email_sent_at"],
    },
  ],
};

export const adminFilledNormalizer = {
  containerKeys: ["admin_filled", "adminFilled"],
  mappings: [
    {
      target: "discount",
      sources: ["discount"],
    },
    {
      target: "admin_comment",
      sources: ["admin_comment"],
    },
    {
      target: "remaining_fees",
      sources: ["remaining_fees"],
    },
    {
      target: "course_duration",
      sources: ["course_duration"],
    },
    {
      target: "payment_options",
      sources: ["payment_options"],
    },
    {
      target: "final_course_Name",
      sources: ["final_course_Name", "finalCourseName"],
    },
    {
      target: "total_course_fees",
      sources: ["total_course_fees"],
    },
    {
      target: "first_installment_amount",
      sources: ["first_installment_amount"],
    },
    {
      target: "second_installment_amount",
      sources: ["second_installment_amount"],
    },
    {
      target: "second_installment_date",
      sources: ["second_installment_date"],
    },
    {
      target: "final_fee_payment_amount",
      sources: ["final_fee_payment_amount"],
    },
  ],
};
