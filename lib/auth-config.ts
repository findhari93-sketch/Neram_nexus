export type AppRole = "superadmin" | "admin" | "teacher" | "student";

// Map Azure App Role values to app roles
// These must match the "value" field in your Azure app registration manifest
export const AZURE_ROLE_MAPPINGS: Record<string, AppRole> = {
  "SuperAdmin.AccessAll": "superadmin", // Matches manifest value
  Admin: "admin",
  Teacher: "teacher",
  Student: "student",
};

export const DEFAULT_ROLE: AppRole = "student";

export function mapAzureRoleToAppRole(roles?: string[] | null): AppRole {
  if (roles && roles.length > 0) {
    for (const r of roles) {
      const mapped = AZURE_ROLE_MAPPINGS[r];
      if (mapped) return mapped;
    }
  }
  return DEFAULT_ROLE;
}

export function verifyTenant(
  profileTenantId: string | undefined,
  allowedTenantId?: string
): boolean {
  if (!allowedTenantId) return true; // if not configured, allow
  return profileTenantId === allowedTenantId;
}
