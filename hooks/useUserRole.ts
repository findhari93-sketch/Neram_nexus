// hooks/useUserRole.ts
"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

export type UserRole = "admin" | "super_admin" | "teacher" | "student" | null;

/**
 * Hook to get current user's role from NextAuth session
 * @returns User role or null if not authenticated
 */
export function useUserRole(): UserRole {
  const { data: session, status } = useSession();

  return useMemo(() => {
    if (status === "loading" || !session?.user) {
      return null;
    }

    // Extract role from session user object (set in NextAuth callbacks)
    const role = (session.user as any)?.role as string;

    // Validate role against allowed values
    if (["admin", "super_admin", "teacher", "student"].includes(role)) {
      return role as UserRole;
    }

    return null;
  }, [session, status]);
}

/**
 * Hook to check if user has permission to edit
 */
export function useCanEdit(): boolean {
  const role = useUserRole();
  return role === "admin" || role === "super_admin";
}
