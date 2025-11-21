import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

// Environment variables
const {
  AZ_TENANT_ID,
  AZ_CLIENT_ID,
  AZ_CLIENT_SECRET,
  AZ_SENDER_USER,
  HELP_DESK_EMAIL,
  APP_BASE_URL,
} = process.env;

/**
 * Get Microsoft Graph API access token using client credentials flow
 */
async function getGraphToken(): Promise<string | null> {
  if (!AZ_TENANT_ID || !AZ_CLIENT_ID || !AZ_CLIENT_SECRET) {
    console.warn(
      "[approve API] Azure AD credentials not configured - email sending will be skipped"
    );
    return null;
  }

  const tokenUrl = `https://login.microsoftonline.com/${AZ_TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: AZ_CLIENT_ID,
    scope: "https://graph.microsoft.com/.default",
    client_secret: AZ_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[approve API] Failed to get Graph token: ${response.status} ${errorText}`
    );
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Send email using Microsoft Graph API
 */
async function sendMail(
  graphToken: string,
  toEmail: string,
  subject: string,
  htmlBody: string
): Promise<void> {
  if (!AZ_SENDER_USER) {
    throw new Error("AZ_SENDER_USER not configured for sending mail");
  }

  const endpoint = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
    AZ_SENDER_USER
  )}/sendMail`;

  const payload = {
    message: {
      subject,
      body: {
        contentType: "HTML",
        content: htmlBody,
      },
      toRecipients: [
        {
          emailAddress: {
            address: toEmail,
          },
        },
      ],
      replyTo: HELP_DESK_EMAIL
        ? [{ emailAddress: { address: HELP_DESK_EMAIL } }]
        : [],
    },
    saveToSentItems: true,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${graphToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${response.status} ${errorText}`);
  }
}

/**
 * Generate a secure random payment token
 */
function generatePaymentToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Store payment metadata in the database
 */
async function storePaymentToken(
  userId: string,
  token: string,
  amount: number,
  type: string,
  expiryDays: number = 7
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  const paymentMetadata = {
    token,
    expires_at: expiresAt.toISOString(),
    payable_amount: Number(amount),
    payment_type: String(type),
    token_used: false,
    generated_at: new Date().toISOString(),
  };

  // Get existing application_details
  const { data: existingRow } = await supabase
    .from("users_duplicate")
    .select("application_details")
    .eq("id", userId)
    .single();

  const updatedAppDetails = {
    ...(existingRow?.application_details || {}),
    payment_metadata: paymentMetadata,
  };

  const { error } = await supabase
    .from("users_duplicate")
    .update({
      application_details: updatedAppDetails,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[approve API] Failed to store payment token:", error);
    throw new Error("Failed to store payment metadata");
  }

  return paymentMetadata;
}

/**
 * Format date for email display
 */
function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const datePart = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} | ${timePart}`;
  } catch {
    return isoDate;
  }
}

/**
 * Generate approval email HTML
 */
function generateApprovalEmailHTML(data: {
  applicantName: string;
  applicationNumber: string;
  courseName: string;
  courseDuration: string;
  approvedAt: string;
  approvedBy: string;
  totalCourseFees: number;
  discount: number;
  finalFeePayment: number;
  paymentOptionText: string;
  directPayUrl: string;
  razorPayUrl: string;
}): string {
  const {
    applicantName,
    applicationNumber,
    courseName,
    courseDuration,
    approvedAt,
    approvedBy,
    totalCourseFees,
    discount,
    finalFeePayment,
    paymentOptionText,
    directPayUrl,
    razorPayUrl,
  } = data;

  const discountText =
    discount > 0
      ? `( you are missing Rs.${discount} Discount on Full Payment i.e: Rs.${
          totalCourseFees - discount
        } )`
      : "";

  const helpDeskEmail = HELP_DESK_EMAIL || "support@neram.co.in";
  const baseUrl = APP_BASE_URL || "http://localhost:3000";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #4a148c; color: #fff; padding: 20px; text-align: right; }
    .header .logo { float: left; font-size: 20px; font-weight: bold; }
    .header .logo .pink { color: #ff4081; }
    .header-info { font-size: 12px; line-height: 1.6; }
    .success-banner { background: #4caf50; color: #fff; padding: 20px; }
    .success-banner h2 { margin: 0 0 5px 0; font-size: 18px; }
    .success-banner p { margin: 0; font-size: 14px; }
    .success-banner a { color: #fff; text-decoration: underline; float: right; font-size: 13px; }
    .section-title { background: #4a148c; color: #fff; text-align: center; padding: 12px; font-size: 16px; font-weight: bold; margin: 20px 0 0 0; }
    .details-section { display: table; width: 100%; border-collapse: collapse; }
    .details-row { display: table-row; }
    .details-label { display: table-cell; padding: 15px 20px; font-weight: bold; color: #fff; background: #7b1fa2; width: 40%; border-bottom: 2px solid #fff; font-size: 14px; }
    .details-value { display: table-cell; padding: 15px 20px; background: #fce4ec; border-bottom: 2px solid #fff; font-size: 14px; color: #333; }
    .fees-section { background: #fff; padding: 20px; }
    .fees-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 14px; }
    .fees-label { font-weight: bold; color: #7b1fa2; }
    .fees-value { color: #333; }
    .final-fee { background: #4a148c; color: #fff; padding: 15px 20px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
    .buttons { text-align: center; padding: 20px; }
    .btn { display: inline-block; padding: 12px 30px; margin: 5px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; }
    .btn-purple { background: #7b1fa2; color: #fff; }
    .btn-white { background: #fff; color: #4a148c; border: 2px solid #4a148c; }
    .cashback { text-align: center; padding: 10px; font-size: 13px; color: #666; }
    .footer { padding: 20px; text-align: center; background: #f5f5f5; }
    .social-links { margin: 15px 0; }
    .social-links a { display: inline-block; margin: 0 10px; }
    .footer-text { font-size: 11px; color: #666; line-height: 1.6; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">neram<span class="pink">Classes.com</span></div>
      <div class="header-info">
        Need help? <a href="mailto:${helpDeskEmail}" style="color: #fff;">Contact us</a><br>
        Application Number: ${applicationNumber}
      </div>
    </div>

    <!-- Success Banner -->
    <div class="success-banner">
      <h2>Congratulations ${applicantName},</h2>
      <p>Your Application has been Approved</p>
      <a href="${baseUrl}/application/${applicationNumber}">View Application</a>
    </div>

    <!-- Title -->
    <div class="section-title">Complete Fee Payment to get enrolled for the Class</div>

    <!-- Course Details -->
    <div class="details-section">
      <div class="details-row">
        <div class="details-label">Course Name :</div>
        <div class="details-value">${courseName}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Course Duration :</div>
        <div class="details-value">${courseDuration}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Approved At :</div>
        <div class="details-value">${formatDate(approvedAt)}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Approved By :</div>
        <div class="details-value">${approvedBy}</div>
      </div>
      <div class="details-row">
        <div class="details-label">Enrollment Request :</div>
        <div class="details-value" style="color: #4caf50; font-weight: bold;">Approved</div>
      </div>
    </div>

    <!-- Fees Details -->
    <div class="section-title">Fees Details</div>
    <div class="fees-section">
      <div class="fees-row">
        <div class="fees-label">Total Course Fees :</div>
        <div class="fees-value">Rs.${totalCourseFees} ${discountText}</div>
      </div>
      <div class="fees-row">
        <div class="fees-label">Pay Option :</div>
        <div class="fees-value">${paymentOptionText}</div>
      </div>
    </div>

    <!-- Contact for discount -->
    <div style="text-align: center; padding: 10px; font-size: 13px; color: #666;">
      To avail full payment Rs.${discount} Discount Email Us / <a href="tel:9176137043" style="color: #7b1fa2;">9176137043</a>
    </div>

    <!-- Final Fee Payment -->
    <div class="final-fee">
      Final Fee Payment : Rs.${finalFeePayment}
    </div>

    <!-- Payment Buttons -->
    <div class="buttons">
      <a href="${directPayUrl}" class="btn btn-purple">Direct Pay</a>
      <a href="${razorPayUrl}" class="btn btn-white">Razor Pay</a>
    </div>

    <!-- Cashback Info -->
    <div class="cashback">
      Direct Pay has Rs.100 Cashback offer
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="social-links">
        <a href="https://instagram.com/neramclasses"><img src="https://cdn-icons-png.flaticon.com/32/2111/2111463.png" alt="Instagram" width="24"></a>
        <a href="https://youtube.com/neramclasses"><img src="https://cdn-icons-png.flaticon.com/32/1384/1384060.png" alt="YouTube" width="24"></a>
        <a href="https://neramclasses.com"><img src="https://cdn-icons-png.flaticon.com/32/281/281769.png" alt="Web" width="24"></a>
      </div>
      <div class="footer-text">
        Click here to <a href="${baseUrl}/unsubscribe">unsubscribe</a> or manage your email preferences.<br>
        Please do not reply to this email. Emails sent to this address will not be answered.<br>
        Copyright © 1999-2025 neramClasses.com, LLC. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate rejection email HTML
 */
function generateRejectionEmailHTML(
  applicantName: string,
  helpDeskEmail: string | undefined
): string {
  const contactInfo = helpDeskEmail || "support@neram.co.in";
  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
      <p>Dear ${applicantName || "Applicant"},</p>
      <p>We're sorry to inform you that your application has been <b>Rejected</b>.</p>
      <p>If you believe this is an error or need assistance, please contact our helpdesk at ${contactInfo}.</p>
      <p>Regards,<br/>Neram Classes</p>
    </div>
  `;
}

/**
 * POST /api/applications/approve
 * Body: { id: string, status: "Approved" | "Rejected" }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const userRole = (session.user as any).role;
    if (userRole !== "admin" && userRole !== "superadmin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { id, status } = body;

    if (!id || !["Approved", "Rejected"].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid payload - id and status (Approved/Rejected) required",
        },
        { status: 400 }
      );
    }

    console.log(`[approve API] Processing ${status} for user ID: ${id}`);

    // Get user data from database
    const { data: user, error: fetchError } = await supabase
      .from("users_duplicate")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !user) {
      console.error("[approve API] User not found:", fetchError);
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Update application status
    const now = new Date().toISOString();
    const approverEmail = (session.user as any).email || "admin";

    const updatedApplicationDetails = {
      ...(user.application_details || {}),
      application_admin_approval: status,
      approved_by: approverEmail,
      approved_at: now,
    };

    const { data: updatedUser, error: updateError } = await supabase
      .from("users_duplicate")
      .update({
        application_details: updatedApplicationDetails,
        updated_at: now,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[approve API] Failed to update user:", updateError);
      return NextResponse.json(
        { error: "Failed to update application status" },
        { status: 500 }
      );
    }

    // Extract user email
    const userEmail =
      user.email || (user.contact && user.contact.email) || null;
    if (!userEmail) {
      return NextResponse.json({
        ok: true,
        updated: updatedUser,
        note: "No email on record; email not sent",
      });
    }

    // Get Graph API token (may be null if not configured)
    const graphToken = await getGraphToken();

    // If no email configuration, just return success without sending email
    if (!graphToken) {
      console.warn(
        "[approve API] Email credentials not configured - skipping email"
      );
      return NextResponse.json({
        ok: true,
        updated: updatedUser,
        emailSent: false,
        note: "Email credentials not configured - email not sent",
      });
    }

    // Extract user name
    const userName =
      user.student_name ||
      (user.basic && user.basic.student_name) ||
      user.name ||
      "Student";

    if (status === "Approved") {
      // Extract admin_filled data for approved email
      const appDetails =
        updatedUser?.application_details || user.application_details || {};
      const adminFilled =
        appDetails.admin_filled ||
        appDetails.admin_filled_details ||
        updatedUser?.admin_filled ||
        user.admin_filled ||
        {};

      // Extract course and financial details
      const courseName =
        adminFilled.final_course_Name ||
        user.selected_course ||
        appDetails.course ||
        "N/A";
      const courseDuration = adminFilled.course_duration || "N/A";
      const totalCourseFees = Number(
        adminFilled.total_course_fees || user.course_fee || 0
      );
      const discount = Number(adminFilled.discount || user.discount || 0);
      const finalFeePayment =
        Number(adminFilled.final_fee_payment_amount) ||
        Number(adminFilled.full_amount_after_discount) ||
        Number(user.total_payable) ||
        0;

      // Payment option
      const paymentOpt = adminFilled.payment_options;
      const paymentOptionLower = Array.isArray(paymentOpt)
        ? String(paymentOpt[0] || "partial").toLowerCase()
        : String(paymentOpt || "partial").toLowerCase();
      const paymentOptionText =
        paymentOptionLower === "full" ? "Full Payment" : "Instalments";

      // Generate payment tokens
      const directToken = generatePaymentToken();
      const razorpayToken = generatePaymentToken();

      // Store payment tokens in database
      await storePaymentToken(id, directToken, finalFeePayment, "direct", 7);
      await storePaymentToken(
        id,
        razorpayToken,
        finalFeePayment,
        "razorpay",
        7
      );

      // Build payment URLs
      const directPayUrl = `${APP_BASE_URL}/pay?v=${encodeURIComponent(
        directToken
      )}&type=direct`;
      const razorPayUrl = `${APP_BASE_URL}/pay?v=${encodeURIComponent(
        razorpayToken
      )}&type=razorpay`;

      // Generate and send approval email
      const approvalEmailHTML = generateApprovalEmailHTML({
        applicantName: userName,
        applicationNumber: String(user.id),
        courseName,
        courseDuration,
        approvedAt: now,
        approvedBy: approverEmail,
        totalCourseFees,
        discount,
        finalFeePayment,
        paymentOptionText,
        directPayUrl,
        razorPayUrl,
      });

      await sendMail(
        graphToken,
        userEmail,
        "Your application is approved – complete payment",
        approvalEmailHTML
      );

      console.log(`[approve API] Approval email sent to ${userEmail}`);
    } else {
      // Send rejection email
      const rejectionEmailHTML = generateRejectionEmailHTML(
        userName,
        HELP_DESK_EMAIL
      );

      await sendMail(
        graphToken,
        userEmail,
        "Your application status – rejected",
        rejectionEmailHTML
      );

      console.log(`[approve API] Rejection email sent to ${userEmail}`);
    }

    return NextResponse.json({
      ok: true,
      updated: updatedUser,
      emailSent: true,
    });
  } catch (error: any) {
    console.error("[approve API] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
