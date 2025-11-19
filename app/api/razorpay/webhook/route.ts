import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from "crypto";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!RAZORPAY_WEBHOOK_SECRET) {
  console.error("Missing RAZORPAY_WEBHOOK_SECRET");
}

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.error("[webhook] Missing webhook secret");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * POST /api/razorpay/webhook
 * Handles Razorpay payment webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.warn("[webhook] Missing signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify signature
    if (!verifyWebhookSignature(body, signature)) {
      console.warn("[webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const event = payload.event || "(unknown)";
    console.log(`[webhook] Received event: ${event}`);

    // Extract application_id from notes
    let applicationId: string | null = null;
    let paymentEntity: any = null;

    // Try to get payment entity and notes
    if (payload.payload?.payment?.entity) {
      paymentEntity = payload.payload.payment.entity;
      applicationId = paymentEntity.notes?.application_id;
    } else if (payload.payload?.payment_link?.entity) {
      const linkEntity = payload.payload.payment_link.entity;
      applicationId = linkEntity.notes?.application_id;
      paymentEntity = linkEntity;
    }

    // Fallback: search by payment_link_id
    if (!applicationId && payload.payload?.payment_link?.entity?.id) {
      const linkId = payload.payload.payment_link.entity.id;
      const { data: user } = await supabase
        .from("users_duplicate")
        .select("id, application_details")
        .eq("application_details->>payment_link_id", linkId)
        .single();

      if (user) {
        applicationId = user.id;
      }
    }

    if (!applicationId) {
      console.warn("[webhook] Could not extract application_id from payload");
      // Return 200 to prevent retries for events we can't process
      return NextResponse.json({ received: true });
    }

    // Fetch user from database
    const { data: user, error: fetchError } = await supabase
      .from("users_duplicate")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (fetchError || !user) {
      console.warn(`[webhook] User not found: ${applicationId}`);
      return NextResponse.json({ received: true });
    }

    const appDetails = user.application_details || {};

    // Create payment history entry
    const historyEntry = {
      event,
      payment_id: paymentEntity?.id || null,
      amount: paymentEntity?.amount ? paymentEntity.amount / 100 : null,
      method: paymentEntity?.method || null,
      status: paymentEntity?.status || null,
      received_at: new Date().toISOString(),
      webhook_payload: payload,
    };

    // Determine new payment status
    let newPaymentStatus = appDetails.payment_status || "pending";

    if (event === "payment_link.paid" || event === "payment.captured") {
      newPaymentStatus = "paid";

      // Mark payment token as used
      if (appDetails.payment_metadata) {
        appDetails.payment_metadata.token_used = true;
        appDetails.payment_metadata.used_at = new Date().toISOString();
        appDetails.payment_metadata.payment_id = paymentEntity?.id;
      }
    } else if (event === "payment.failed" || event === "payment_link.failed") {
      newPaymentStatus = "failed";
    } else if (
      event === "payment_link.cancelled" ||
      event === "payment.cancelled"
    ) {
      newPaymentStatus = "cancelled";
    }

    // Update payment history
    const paymentHistory = Array.isArray(appDetails.payment_history)
      ? appDetails.payment_history
      : [];
    paymentHistory.push(historyEntry);

    // Update user record
    const updatedAppDetails = {
      ...appDetails,
      payment_status: newPaymentStatus,
      payment_at:
        newPaymentStatus === "paid" ? new Date().toISOString() : appDetails.payment_at,
      payment_method: paymentEntity?.method || appDetails.payment_method,
      payment_history: paymentHistory,
      razorpay_payment_id: paymentEntity?.id || appDetails.razorpay_payment_id,
      razorpay_order_id:
        paymentEntity?.order_id || appDetails.razorpay_order_id,
    };

    await supabase
      .from("users_duplicate")
      .update({
        application_details: updatedAppDetails,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    console.log(
      `[webhook] Processed ${event} for user ${applicationId}, new status: ${newPaymentStatus}`
    );

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
