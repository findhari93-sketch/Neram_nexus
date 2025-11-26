/**
 * Custom hook for user mutations with optimistic updates
 * Provides instant UI feedback for update/delete operations
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { updateUser, deleteUser } from "@/lib/api/users";
import type { NormalizedUser } from "./useUserData";
import {
  optimisticUpdateUser,
  optimisticDeleteUser,
  rollbackOptimisticUpdate,
  invalidateOnSuccess,
} from "@/lib/utils/optimisticUpdates";

interface UseUserMutationsParams {
  pageIndex: number;
  pageSize: number;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

interface UseUserMutationsResult {
  updateMutation: UseMutationResult<
    unknown,
    Error,
    { id: string | number; data: Record<string, unknown> }
  >;
  deleteMutation: UseMutationResult<unknown, Error, string | number>;
}

/**
 * Hook providing optimistic update and delete mutations
 */
export function useUserMutations(
  params: UseUserMutationsParams
): UseUserMutationsResult {
  const queryClient = useQueryClient();
  const queryKey = ["users_duplicate", params.pageIndex, params.pageSize];

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: Record<string, unknown>;
    }) => {
      return await updateUser(id, data);
    },
    // Optimistic update: Update UI immediately before server confirms
    onMutate: async ({ id, data }) => {
      const context = await optimisticUpdateUser(
        queryClient,
        queryKey,
        id,
        data
      );
      return context;
    },
    // Success: Replace optimistic data with server truth
    onSuccess: (_, __, context) => {
      invalidateOnSuccess(queryClient, queryKey);
      params.onSuccess?.("User updated successfully!");
    },
    // Error: Rollback optimistic update
    onError: (error, _, context) => {
      rollbackOptimisticUpdate(queryClient, queryKey, context);
      params.onError?.(
        `Failed to update user: ${error.message || "Unknown error"}`
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await deleteUser(id);
    },
    // Optimistic delete: Remove from UI immediately
    onMutate: async (id) => {
      const context = await optimisticDeleteUser(queryClient, queryKey, id);
      return context;
    },
    // Success: Replace optimistic data with server truth
    onSuccess: (_, __, context) => {
      invalidateOnSuccess(queryClient, queryKey);
      params.onSuccess?.("User deleted successfully!");
    },
    // Error: Rollback optimistic delete
    onError: (error, _, context) => {
      rollbackOptimisticUpdate(queryClient, queryKey, context);
      params.onError?.(
        `Failed to delete user: ${error.message || "Unknown error"}`
      );
    },
  });

  return {
    updateMutation,
    deleteMutation,
  };
}
