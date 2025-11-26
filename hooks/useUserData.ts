/**
 * Custom hook for fetching and normalizing user data
 * Extracts data fetching logic from WebUsersGrid component
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";
import { fetchUsers } from "@/lib/api/users";
import {
  resolvePhotoFromRow,
  clearPhotoCache,
} from "@/lib/utils/photoResolver";
import { logger } from "@/lib/utils/logger";
import {
  normalizeFields,
  normalizeArrayField,
  accountNormalizer,
  basicNormalizer,
  contactNormalizer,
  educationNormalizer,
  applicationNormalizer,
  adminFilledNormalizer,
} from "@/lib/utils/userNormalization";

// Import existing schemas from WebUsersGrid
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

export interface NormalizedUser extends Record<string, unknown> {
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

type RawRow = Record<string, unknown>;

interface UsersDataResult {
  rows: NormalizedUser[];
  rowCount: number;
  validationErrors: number;
}

interface UseUserDataParams {
  pageIndex: number;
  pageSize: number;
  enabled?: boolean;
}

/**
 * Retry configuration with exponential backoff
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attemptIndex: number): number {
  const delay =
    RETRY_CONFIG.initialDelay *
    Math.pow(RETRY_CONFIG.backoffMultiplier, attemptIndex);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

/**
 * Check if user is online (for better offline UX)
 */
function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Normalize a single raw database row into NormalizedUser format
 * Uses generic normalization utilities instead of duplicate functions
 */
function normalizeRow(rawRow: RawRow): Partial<NormalizedUser> {
  const normalized: Partial<NormalizedUser> = { ...rawRow };

  // Apply all normalizers using the generic utility
  normalizeFields(rawRow, normalized, accountNormalizer);
  normalizeFields(rawRow, normalized, basicNormalizer);
  normalizeFields(rawRow, normalized, contactNormalizer);
  normalizeFields(rawRow, normalized, educationNormalizer);
  normalizeFields(rawRow, normalized, applicationNormalizer);
  normalizeFields(rawRow, normalized, adminFilledNormalizer);

  // Normalize array field (providers)
  normalizeArrayField(normalized, "providers");

  // Store the raw contact object for backward compatibility
  if (rawRow.contact) {
    normalized.contact = rawRow.contact;
  }

  // Resolve and cache photo URL
  try {
    const photoUrl = resolvePhotoFromRow(rawRow);
    if (photoUrl) {
      normalized.photo_url = photoUrl;
    }
  } catch (error) {
    logger.warn("Photo resolution failed", { rowId: rawRow.id, error });
  }

  return normalized;
}

/**
 * Validate normalized row against schema
 * Returns validated data or logs error and returns undefined
 */
function validateRow(
  normalized: Partial<NormalizedUser>,
  rowIndex: number
): NormalizedUser | undefined {
  const result = NormalizedUserSchema.safeParse(normalized);

  if (result.success) {
    return result.data as NormalizedUser;
  }

  // Log validation errors in development
  if (process.env.NODE_ENV === "development") {
    console.warn(`Row ${rowIndex} validation failed:`, {
      id: normalized.id,
      errors: result.error.issues,
      row: normalized,
    });
  }

  // TODO: Send to error tracking in production
  // Example: Sentry.captureException(result.error, { extra: { rowIndex, normalized } });

  return undefined;
}

/**
 * Hook for fetching and normalizing user data with proper error handling
 */
export function useUserData(
  params: UseUserDataParams
): UseQueryResult<UsersDataResult, Error> {
  return useQuery({
    queryKey: ["users_duplicate", params.pageIndex, params.pageSize],
    queryFn: async ({ signal }): Promise<UsersDataResult> => {
      // Check online status before attempting fetch
      if (!isOnline()) {
        throw new Error(
          "You are offline. Please check your internet connection."
        );
      }

      // Clear photo cache on fresh fetch
      clearPhotoCache();

      try {
        // Fetch from secure API route
        const response = await fetchUsers({
          pageIndex: params.pageIndex,
          pageSize: params.pageSize,
        });

        const rawRows = (response.rows as RawRow[]) ?? [];

        // Normalize and validate rows
        const validRows: NormalizedUser[] = [];
        let validationErrors = 0;

        for (let i = 0; i < rawRows.length; i++) {
          const normalized = normalizeRow(rawRows[i]);
          const validated = validateRow(normalized, i);

          if (validated) {
            validRows.push(validated);
          } else {
            validationErrors++;
          }
        }

        // Log summary in development
        if (validationErrors > 0) {
          logger.warn(
            `Skipped ${validationErrors} rows due to validation errors`,
            { validationErrors }
          );
        }

        return {
          rows: validRows,
          rowCount: response.rowCount,
          validationErrors,
        };
      } catch (error) {
        logger.error("User data fetch failed", error, {
          params,
          online: isOnline(),
        });

        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if offline
      if (!isOnline()) {
        return false;
      }

      // Don't retry on client errors (4xx)
      if (error instanceof Error && error.message.includes("40")) {
        return false;
      }

      // Retry on server errors (5xx) and network errors
      return failureCount < RETRY_CONFIG.maxRetries;
    },
    retryDelay: (attemptIndex) => getRetryDelay(attemptIndex),
    placeholderData: (previousData) => previousData,
    enabled: params.enabled ?? true,
    // Stale time: 30 seconds (prevents unnecessary refetches)
    staleTime: 30000,
    // Refetch on window focus (disabled for now, can be enabled if needed)
    refetchOnWindowFocus: false,
  });
}

/**
 * Export types for use in components
 */
export type { UsersDataResult, UseUserDataParams };
