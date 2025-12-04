import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { z, ZodError } from "zod";
import type { ExamCenter } from "@/data/types";

// Validation schema for updates (all fields optional)
const ExamCenterUpdateSchema = z.object({
  exam_type: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  center_name: z.string().optional(),
  center_code: z.string().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contact_person: z.string().optional(),
  contact_designation: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  active_years: z.array(z.number()).optional(),
  is_confirmed_current_year: z.boolean().optional(),
  status: z.enum(["active", "inactive", "discontinued"]).optional(),
  facilities: z.string().optional(),
  instructions: z.string().optional(),
  nearest_railway: z.string().optional(),
  nearest_bus_stand: z.string().optional(),
  landmarks: z.string().optional(),
  capacity: z.number().optional(),
  description: z.string().optional(),
  alternate_phone: z.string().optional(),
  google_maps_link: z.string().optional(),
});

type ExamCenterUpdate = z.infer<typeof ExamCenterUpdateSchema>;

// Check authorization
async function checkAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      ),
    };
  }

  const userRoles = (session.user as any).roles || [];
  const isAdmin =
    userRoles.includes("admin") || userRoles.includes("super_admin");

  if (!isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { 
          error: "Forbidden - Admin access required",
          userRoles: userRoles,
          message: "You need 'admin' or 'super_admin' role to access this resource"
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch single exam center
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) return auth.response;

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Exam center ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("exam_centers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Exam center not found" },
          { status: 404 }
        );
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch exam center" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching exam center:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update exam center
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) return auth.response;

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Exam center ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    let validatedData: ExamCenterUpdate;
    try {
      validatedData = ExamCenterUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.issues },
          { status: 400 }
        );
      }
      throw error;
    }

    // Get current user ID for audit trail
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from("exam_centers")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: "Exam center not found" },
        { status: 404 }
      );
    }

    // Update record
    const { data, error } = await supabase
      .from("exam_centers")
      .update({
        ...validatedData,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update exam center" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating exam center:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete exam center
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) return auth.response;

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Exam center ID is required" },
        { status: 400 }
      );
    }

    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from("exam_centers")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: "Exam center not found" },
        { status: 404 }
      );
    }

    // Delete record
    const { error } = await supabase.from("exam_centers").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete exam center" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Exam center deleted" });
  } catch (error) {
    console.error("Error deleting exam center:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
