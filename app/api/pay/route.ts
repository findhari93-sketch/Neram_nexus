import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import Razorpay from "razorpay";

// Force dynamic rendering (uses searchParams)
export const dynamic = "force-dynamic";

// Environment variables
const {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  APP_BASE_URL,
} = process.env;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error("Missing Razorpay credentials");
}

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID!,
  key_secret: RAZORPAY_KEY_SECRET!,
});

/**
 * Verify payment token and get user data
 */
async function verifyToken(token: string) {
  // Search for user with this payment token
  const { data: users, error } = await supabase
    .from("users_duplicate")
    .select("*")
    .not("application_details", "is", null);

  if (error || !users) {
    throw new Error("Failed to fetch users");
  }

  // Find user with matching token
  for (const user of users) {
    const appDetails = user.application_details || {};
    const paymentMeta = appDetails.payment_metadata;

    if (paymentMeta && paymentMeta.token === token) {
      // Check if token is expired
      if (paymentMeta.expires_at) {
        const expiresAt = new Date(paymentMeta.expires_at);
        if (expiresAt < new Date()) {
          throw new Error("Payment link has expired");
        }
      }

      // Check if token was already used
      if (paymentMeta.token_used === true) {
        throw new Error("Payment link has already been used");
      }

      return {
        user,
        amount: paymentMeta.payable_amount,
        type: paymentMeta.payment_type,
      };
    }
  }

  throw new Error("Invalid or expired payment link");
}

/**
 * GET /api/pay?v=<token>&type=<direct|razorpay>
 * Creates Razorpay payment link and redirects user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("v");
    const type = searchParams.get("type") || "razorpay";
    const baseUrl = APP_BASE_URL || "http://localhost:3000";

    if (!token) {
      return NextResponse.json(
        { error: "Missing payment token" },
        { status: 400 }
      );
    }

    // Verify token and get user data
    let userData;
    try {
      userData = await verifyToken(token);
    } catch (err: any) {
      console.error("[pay API] Token verification failed:", err.message);
      return NextResponse.redirect(
        `${baseUrl}/payment/error?message=${encodeURIComponent(
          err.message
        )}`
      );
    }

    const { user, amount } = userData;

    // Check if already paid
    const appDetails = user.application_details || {};
    if (appDetails.payment_status === "paid") {
      return NextResponse.redirect(
        `${baseUrl}/payment/success?already_paid=true`
      );
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountPaise = Math.round(Number(amount) * 100);

    // Get course name
    const adminFilled = appDetails.admin_filled || {};
    const courseName =
      adminFilled.final_course_Name ||
      user.selected_course ||
      appDetails.course ||
      "Course";

    // Create Razorpay Payment Link
    const paymentLinkData = {
      amount: amountPaise,
      currency: "INR",
      accept_partial: false,
      reference_id: `app_${user.id}_${Date.now()}`,
      description: `Payment for ${courseName} - Application ${user.id}`,
      customer: {
        name: user.student_name || user.name || "Student",
        email: user.email || undefined,
        contact: user.phone || undefined,
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      notes: {
        application_id: user.id,
        payment_token: token,
        payment_type: type,
      },
      callback_url: `${baseUrl}/payment/callback`,
      callback_method: "get",
    };

    let paymentLink;
    try {
      paymentLink = await razorpay.paymentLink.create(paymentLinkData);
    } catch (razorpayErr: any) {
      console.error("[pay API] Razorpay error:", razorpayErr);
      return NextResponse.redirect(
        `${baseUrl}/payment/error?message=Payment provider error`
      );
    }

    // Save payment link info to database
    const updatedAppDetails = {
      ...appDetails,
      payment_link_id: paymentLink.id,
      payment_link_url: paymentLink.short_url,
      payment_status: "payment_link_created",
      payment_link_created_at: new Date().toISOString(),
    };

    await supabase
      .from("users_duplicate")
      .update({
        application_details: updatedAppDetails,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    console.log(
      `[pay API] Created payment link for user ${user.id}, amount: ${amount}`
    );

    // Redirect to Razorpay payment page
    return NextResponse.redirect(paymentLink.short_url);
  } catch (error: any) {
    console.error("[pay API] Error:", error);
    const baseUrl = APP_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/payment/error?message=Internal server error`
    );
  }
}
