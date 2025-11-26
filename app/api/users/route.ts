// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabaseClient";
import { z } from "zod";

// Validation schema for user updates
const UserUpdateSchema = z.object({
  basic: z
    .object({
      student_name: z.string().min(1).max(100).optional(),
      father_name: z.string().min(1).max(100).optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      dob: z.string().optional(),
    })
    .optional(),
  contact: z
    .object({
      email: z.string().email().optional(),
      phone: z
        .string()
        .regex(/^\+?[\d\s-()]+$/)
        .optional(),
      city: z.string().max(50).optional(),
      state: z.string().max(50).optional(),
      country: z.string().max(50).optional(),
      zip_code: z.string().max(10).optional(),
    })
    .optional(),
});

// Helper to verify user role from session
async function getUserRole(session: any): Promise<string | null> {
  if (!session?.user?.email) return null;

  // TODO: Fetch actual role from your users table or JWT claims
  // For now, checking if user exists in session
  // Replace with: const { data } = await supabase.from('admins').select('role').eq('email', session.user.email).single();
  return "admin"; // Temporarily returning admin - MUST BE REPLACED
}

// GET /api/users - Fetch paginated users with server-side authorization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = await getUserRole(session);
    if (!userRole || !["admin", "super_admin"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const pageIndex = parseInt(searchParams.get("pageIndex") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    // Validate pagination params
    if (pageIndex < 0 || pageSize < 1 || pageSize > 200) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const start = pageIndex * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
      .from("users_duplicate")
      .select("*", { count: "exact" })
      .range(start, end)
      .order("id", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      rows: data || [],
      rowCount: count || 0,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user with validation
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = await getUserRole(session);
    if (!userRole || !["admin", "super_admin"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, data: updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Validate update data
    const validationResult = UserUpdateSchema.safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Fetch current row for atomic JSONB update
    const { data: currentRow, error: fetchError } = await supabase
      .from("users_duplicate")
      .select("basic, contact")
      .eq("id", id)
      .single();

    if (fetchError || !currentRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare atomic JSONB updates using Supabase's JSONB operators
    const updatePayload: any = {};

    if (updateData.basic) {
      updatePayload.basic = {
        ...(currentRow.basic || {}),
        ...updateData.basic,
      };
    }

    if (updateData.contact) {
      updatePayload.contact = {
        ...(currentRow.contact || {}),
        ...updateData.contact,
      };
    }

    // Perform update
    const { error: updateError } = await supabase
      .from("users_duplicate")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user with authorization
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = await getUserRole(session);
    if (!userRole || !["admin", "super_admin"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("users_duplicate")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
