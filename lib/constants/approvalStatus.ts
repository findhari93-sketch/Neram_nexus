/**
 * Application approval status constants
 * Prevents magic strings and provides type safety
 */

export const APPROVAL_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
  NOT_SUBMITTED: "not_submitted",
} as const;

export type ApprovalStatusType =
  (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS];

/**
 * Check if a value is a valid approval status
 */
export function isValidApprovalStatus(
  value: unknown
): value is ApprovalStatusType {
  if (typeof value !== "string") return false;
  const normalized = value.toLowerCase();
  return Object.values(APPROVAL_STATUS).includes(
    normalized as ApprovalStatusType
  );
}

/**
 * Normalize approval status to lowercase constant
 */
export function normalizeApprovalStatus(
  value: unknown
): ApprovalStatusType | null {
  if (typeof value !== "string") return null;
  const normalized = value.toLowerCase();

  if (normalized === APPROVAL_STATUS.APPROVED) return APPROVAL_STATUS.APPROVED;
  if (normalized === APPROVAL_STATUS.REJECTED) return APPROVAL_STATUS.REJECTED;
  if (normalized === APPROVAL_STATUS.PENDING) return APPROVAL_STATUS.PENDING;

  return null;
}
