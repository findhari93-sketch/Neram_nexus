// lib/api/users.ts
/**
 * Client-side API helpers for user operations
 * All database operations go through secure API routes
 */

export interface PaginationParams {
  pageIndex: number;
  pageSize: number;
}

export interface UserListResponse {
  rows: any[];
  rowCount: number;
}

export interface UserUpdateData {
  basic?: {
    student_name?: string;
    father_name?: string;
    gender?: string;
    dob?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
  };
}

/**
 * Fetch paginated users from API route
 */
export async function fetchUsers(
  params: PaginationParams
): Promise<UserListResponse> {
  const url = new URL("/api/users", window.location.origin);
  url.searchParams.set("pageIndex", params.pageIndex.toString());
  url.searchParams.set("pageSize", params.pageSize.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Update user via API route
 */
export async function updateUser(
  id: string | number,
  data: UserUpdateData
): Promise<void> {
  const response = await fetch("/api/users", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ id, data }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Update failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Delete user via API route
 */
export async function deleteUser(id: string | number): Promise<void> {
  const url = new URL("/api/users", window.location.origin);
  url.searchParams.set("id", id.toString());

  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Delete failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
