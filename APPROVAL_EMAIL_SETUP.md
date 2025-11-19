# Class Request Approval & Email System

This document explains how the approval/rejection email system works for class join requests.

## Overview

When an admin clicks "Approve" or "Reject" on a class join request detail page, the system:

1. Updates the application status in the database
2. Sends a professionally formatted email to the applicant
3. For approved applications, generates secure payment tokens and includes payment links

## Architecture

```
User clicks Approve/Reject
       ↓
Frontend (class-requests/[id]/page.tsx)
       ↓
API Route (/api/applications/approve)
       ↓
├── Update Database (Supabase)
├── Generate Payment Tokens (for approved)
└── Send Email (Microsoft Graph API)
```

## Files Created/Modified

### 1. API Route
**Location**: `app/api/applications/approve/route.ts`

This is the main serverless function that handles:
- Authentication (verifies admin role via NextAuth session)
- Database updates
- Payment token generation
- Email sending via Microsoft Graph API

### 2. Frontend Integration
**Location**: `app/(protected)/class-requests/[id]/page.tsx`

Modified `handleApproval` function to call the API endpoint instead of directly updating the database.

## Setup Instructions

### 1. Environment Variables

Add these variables to your `.env.local` file:

```env
# Azure AD Configuration for Email Sending
AZ_CLIENT_ID=your-azure-ad-client-id
AZ_CLIENT_SECRET=your-azure-ad-client-secret
AZ_TENANT_ID=your-azure-ad-tenant-id
AZ_SENDER_USER=sender@yourdomain.com

# Optional Configuration
HELP_DESK_EMAIL=support@neram.co.in
APP_BASE_URL=https://neramclasses.com
```

### 2. Azure AD App Registration

You need to register an app in Azure AD with the following permissions:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Create a new registration or use existing one
4. Under **API permissions**, add:
   - `Microsoft Graph` > `Application permissions` > `Mail.Send`
5. Grant admin consent for the permissions
6. Under **Certificates & secrets**, create a new client secret
7. Copy the Client ID, Tenant ID, and Client Secret to your `.env.local`

### 3. Configure Sender Email

The `AZ_SENDER_USER` must be:
- A valid user in your Azure AD tenant
- The app must have delegated access to send mail on behalf of this user
- Typically this would be a shared mailbox like `noreply@yourdomain.com`

## Email Templates

### Approval Email

The approval email includes:
- Student name and application details
- Course information (name, duration)
- Fee breakdown (total, discount, final amount)
- Payment options (Full/Installments)
- Secure payment links (Direct Pay & Razorpay)
- Company branding and footer

### Rejection Email

A simple, professional email informing the applicant of the rejection and providing helpdesk contact information.

## Payment Token System

For approved applications, the system generates:

1. **Secure Random Tokens**: 64-character hexadecimal strings
2. **Token Metadata**: Stored in `application_details.payment_metadata`
   - `token`: The secure token string
   - `expires_at`: Token expiry date (7 days by default)
   - `payable_amount`: Amount to be paid
   - `payment_type`: "direct" or "razorpay"
   - `token_used`: Boolean flag to prevent reuse
   - `generated_at`: Timestamp

3. **Payment URLs**:
   - Direct Pay: `${APP_BASE_URL}/pay?v=${token}&type=direct`
   - Razorpay: `${APP_BASE_URL}/pay?v=${token}&type=razorpay`

## API Endpoint Details

### POST `/api/applications/approve`

**Authentication**: Requires NextAuth session with `admin` or `superadmin` role

**Request Body**:
```json
{
  "id": "user-id-or-firebase-uid",
  "status": "Approved" | "Rejected"
}
```

**Response** (Success):
```json
{
  "ok": true,
  "updated": { /* Updated user object */ },
  "emailSent": true
}
```

**Response** (Error):
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Database Schema Updates

The system updates the `users_duplicate` table:

### For All Approvals/Rejections:
```json
{
  "application_details": {
    "application_admin_approval": "Approved" | "Rejected",
    "approved_by": "admin@email.com",
    "approved_at": "2025-01-19T10:30:00.000Z"
  }
}
```

### Additional for Approved (with payment tokens):
```json
{
  "application_details": {
    "payment_metadata": {
      "token": "64-char-hex-string",
      "expires_at": "2025-01-26T10:30:00.000Z",
      "payable_amount": 50000,
      "payment_type": "direct",
      "token_used": false,
      "generated_at": "2025-01-19T10:30:00.000Z"
    }
  }
}
```

## Testing

### Development Testing

1. Ensure all environment variables are set
2. Start the development server: `npm run dev`
3. Navigate to a class request detail page
4. Click "Approve" or "Reject"
5. Check:
   - Browser console for any errors
   - Database for updated `application_details`
   - Email inbox for the sent email

### Production Checklist

- [ ] Azure AD app is properly configured
- [ ] All environment variables are set in production
- [ ] AZ_SENDER_USER email exists and is accessible
- [ ] Mail.Send permission is granted and consented
- [ ] APP_BASE_URL points to production domain
- [ ] Payment page (/pay) is implemented to handle tokens

## Troubleshooting

### Email Not Sending

1. **Check Azure AD permissions**: Ensure `Mail.Send` permission is granted
2. **Verify credentials**: Check AZ_CLIENT_ID, AZ_CLIENT_SECRET, AZ_TENANT_ID
3. **Check sender user**: Ensure AZ_SENDER_USER exists in your tenant
4. **Review logs**: Check server logs for detailed error messages

### Payment Tokens Not Generated

1. **Check database update**: Verify `application_details` is being updated
2. **Review token generation**: Check server logs for token generation errors
3. **Verify crypto support**: Ensure Node.js crypto module is available

### Database Not Updating

1. **Check Supabase credentials**: Verify SUPABASE_SERVICE_ROLE_KEY
2. **Verify user ID**: Ensure the user ID exists in `users_duplicate` table
3. **Review permissions**: Check Supabase RLS policies

## Security Considerations

1. **Payment Tokens**:
   - 256-bit random tokens (cryptographically secure)
   - Stored with expiry dates
   - Single-use flags to prevent reuse

2. **Authentication**:
   - All API calls require valid NextAuth session
   - Role-based access control (admin/superadmin only)

3. **Email Security**:
   - Uses Microsoft Graph API (OAuth 2.0)
   - No password storage required
   - Audit trail via Azure AD logs

## Future Enhancements

Potential improvements:
- [ ] Email templates with dynamic branding
- [ ] SMS notifications for approvals
- [ ] Batch approval functionality
- [ ] Email delivery status tracking
- [ ] Resend email functionality
- [ ] Custom email templates per course type
