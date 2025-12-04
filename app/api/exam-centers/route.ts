import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { z, ZodError } from "zod";
import type { ExamCenter } from "@/data/types";

// Validation schema
const ExamCenterSchema = z.object({
  exam_type: z.string().min(1, "Exam type is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  center_name: z.string().min(1, "Center name is required"),
  center_code: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  pincode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contact_person: z.string().optional(),
  contact_designation: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  active_years: z.array(z.number()).default([]),
  is_confirmed_current_year: z.boolean().default(false),
  status: z.enum(["active", "inactive", "discontinued"]).default("active"),
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

type ExamCenterInput = z.infer<typeof ExamCenterSchema>;

interface ListQuery {
  page?: string;
  limit?: string;
  search?: string;
  exam_type?: string;
  state?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
}

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

  // Check if user has admin or super_admin role
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

// GET - Fetch exam centers with filtering, sorting, pagination
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) return auth.response;

    const searchParams = request.nextUrl.searchParams;
    const query: ListQuery = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("search") || undefined,
      exam_type: searchParams.get("exam_type") || undefined,
      state: searchParams.get("state") || undefined,
      status: searchParams.get("status") || undefined,
      sort_by: searchParams.get("sort_by") || "created_at",
      sort_order: searchParams.get("sort_order") || "desc",
    };

    const page = Math.max(1, parseInt(query.page || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20")));
    const offset = (page - 1) * limit;

    // Build base query
    let dbQuery = supabase.from("exam_centers").select("*", { count: "exact" });

    // Apply filters
    if (query.search) {
      dbQuery = dbQuery.or(
        `center_name.ilike.%${query.search}%,city.ilike.%${query.search}%,state.ilike.%${query.search}%`
      );
    }

    if (query.exam_type) {
      dbQuery = dbQuery.eq("exam_type", query.exam_type);
    }

    if (query.state) {
      dbQuery = dbQuery.eq("state", query.state);
    }

    if (query.status) {
      dbQuery = dbQuery.eq("status", query.status);
    }

    // Apply sorting - use null coalescing to handle undefined
    const sortColumn = query.sort_by || "created_at";
    const sortAscending = query.sort_order === "asc";
    dbQuery = dbQuery.order(sortColumn, { ascending: sortAscending });

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch exam centers" },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: data as ExamCenter[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching exam centers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new exam center
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) return auth.response;

    const body = await request.json();

    // Validate input
    let validatedData: ExamCenterInput;
    try {
      validatedData = ExamCenterSchema.parse(body);
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

    // Insert into database
    const { data, error } = await supabase
      .from("exam_centers")
      .insert([
        {
          ...validatedData,
          created_by: userId,
          updated_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create exam center" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Error creating exam center:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
