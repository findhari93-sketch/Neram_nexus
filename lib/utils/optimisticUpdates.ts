/**
 * React Query optimistic update hooks
 * Provides instant UI feedback without waiting for server response
 */

import { type QueryClient } from "@tanstack/react-query";
import type { NormalizedUser } from "@/hooks/useUserData";

interface UsersQueryData {
  rows: NormalizedUser[];
  rowCount: number;
  validationErrors?: number;
}

interface OptimisticUpdateContext {
  previousData?: UsersQueryData;
}

/**
 * Optimistically update a user in the cache before server confirms
 */
export async function optimisticUpdateUser(
  queryClient: QueryClient,
  queryKey: unknown[],
  userId: string | number,
  updates: Partial<NormalizedUser>
): Promise<OptimisticUpdateContext> {
  // Cancel outgoing refetches to prevent them from overwriting optimistic update
  await queryClient.cancelQueries({ queryKey });

  // Snapshot current data for potential rollback
  const previousData = queryClient.getQueryData<UsersQueryData>(queryKey);

  // Optimistically update cache
  queryClient.setQueryData<UsersQueryData>(queryKey, (old) => {
    if (!old) return old;

    return {
      ...old,
      rows: old.rows.map((row) =>
        row.id === userId ? { ...row, ...updates } : row
      ),
    };
  });

  // Return context for rollback
  return { previousData };
}

/**
 * Optimistically delete a user from the cache before server confirms
 */
export async function optimisticDeleteUser(
  queryClient: QueryClient,
  queryKey: unknown[],
  userId: string | number
): Promise<OptimisticUpdateContext> {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot current data
  const previousData = queryClient.getQueryData<UsersQueryData>(queryKey);

  // Optimistically remove from cache
  queryClient.setQueryData<UsersQueryData>(queryKey, (old) => {
    if (!old) return old;

    return {
      ...old,
      rows: old.rows.filter((row) => row.id !== userId),
      rowCount: old.rowCount - 1,
    };
  });

  return { previousData };
}

/**
 * Rollback optimistic update on error
 */
export function rollbackOptimisticUpdate(
  queryClient: QueryClient,
  queryKey: unknown[],
  context?: OptimisticUpdateContext
): void {
  if (context?.previousData) {
    queryClient.setQueryData(queryKey, context.previousData);
  }
}

/**
 * Invalidate and refetch on success (replaces optimistic data with server truth)
 */
export function invalidateOnSuccess(
  queryClient: QueryClient,
  queryKey: unknown[]
): void {
  queryClient.invalidateQueries({ queryKey });
}
