# Razorpay Payment Integration Guide

This document explains how the Razorpay payment integration works in your application.

## Overview

When an admin approves a class join request, the system:
1. Generates a secure payment token
2. Sends an approval email with payment links
3. User clicks "Razor Pay" button
4. System creates a Razorpay Payment Link
5. User completes payment on Razorpay's secure page
6. Razorpay sends webhook to update payment status
7. Payment details are stored in Supabase

## Architecture

```
User clicks "Razor Pay" in email
       ↓
GET /api/pay?v=<token>&type=razorpay
       ↓
├── Verify payment token
├── Check if not already paid
├── Create Razorpay Payment Link
├── Save link to database
└── Redirect to Razorpay
       ↓
User completes payment on Razorpay
       ↓
Razorpay webhook → POST /api/razorpay/webhook
       ↓
├── Verify webhook signature
├── Extract payment details
├── Update payment status in database
└── Mark token as used
       ↓
User redirected to /payment/callback
       ↓
Success page shown
```

## Files Created

### 1. API Routes

#### `/app/api/pay/route.ts`
- **Purpose**: Creates Razorpay payment link and redirects user
- **Method**: GET
- **Parameters**: `v` (payment token), `type` (direct/razorpay)
- **Flow**:
  1. Verifies payment token from database
  2. Checks token expiry and usage
  3. Gets user and amount details
  4. Creates Razorpay Payment Link
  5. Saves link info to database
  6. Redirects to Razorpay

#### `/app/api/razorpay/webhook/route.ts`
- **Purpose**: Handles payment status updates from Razorpay
- **Method**: POST
- **Security**: Verifies webhook signature using HMAC SHA256
- **Events Handled**:
  - `payment_link.paid` / `payment.captured` → Mark as paid
  - `payment.failed` / `payment_link.failed` → Mark as failed
  - `payment.cancelled` → Mark as cancelled
- **Updates**:
  - Payment status in `application_details.payment_status`
  - Payment history in `application_details.payment_history`
  - Marks token as used
  - Stores payment ID and method

### 2. Payment Pages

#### `/app/payment/callback/page.tsx`
- **Purpose**: Page where users land after completing payment
- **Features**:
  - Shows success/error based on URL params
  - Displays payment ID
  - Provides navigation options

#### `/app/payment/error/page.tsx`
- **Purpose**: Error page for payment failures
- **Shows**: Error message from URL params

#### `/app/payment/success/page.tsx`
- **Purpose**: Success page for completed payments
- **Handles**: Already paid scenarios

## Database Schema

### Payment Data Storage

All payment data is stored in `users_duplicate` table under `application_details` JSONB column:

```json
{
  "application_details": {
    "payment_status": "paid" | "pending" | "failed" | "cancelled" | "payment_link_created",
    "payment_link_id": "plink_xxxxx",
    "payment_link_url": "https://rzp.io/l/xxxxx",
    "payment_link_created_at": "2025-01-19T10:30:00.000Z",
    "payment_at": "2025-01-19T10:35:00.000Z",
    "payment_method": "upi" | "card" | "netbanking" | "wallet",
    "razorpay_payment_id": "pay_xxxxx",
    "razorpay_order_id": "order_xxxxx",

    "payment_metadata": {
      "token": "64-char-hex-string",
      "expires_at": "2025-01-26T10:30:00.000Z",
      "payable_amount": 50000,
      "payment_type": "razorpay",
      "token_used": true,
      "used_at": "2025-01-19T10:35:00.000Z",
      "payment_id": "pay_xxxxx"
    },

    "payment_history": [
      {
        "event": "payment_link.paid",
        "payment_id": "pay_xxxxx",
        "amount": 50000,
        "method": "upi",
        "status": "captured",
        "received_at": "2025-01-19T10:35:00.000Z",
        "webhook_payload": { /* full webhook payload */ }
      }
    ]
  }
}
```

## Environment Variables

Required in `.env.local`:

```env
# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=webhook_secret_string

# Application
APP_BASE_URL=http://localhost:3000  # or https://yourdomain.com in production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Payment Flow Details

### 1. Token Generation (On Approval)

When admin clicks "Approve" in `/api/applications/approve`:
```typescript
// Generate secure random token
const token = crypto.randomBytes(32).toString("hex");

// Store in database with expiry
const paymentMetadata = {
  token,
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  payable_amount: 50000,
  payment_type: "razorpay",
  token_used: false,
};
```

### 2. Email with Payment Link

Approval email includes:
```html
<a href="https://yourdomain.com/api/pay?v=TOKEN&type=razorpay">Razor Pay</a>
```

### 3. Payment Link Creation

When user clicks link:
1. Verify token is valid and not expired
2. Check user hasn't already paid
3. Create Razorpay Payment Link with:
   - Amount in paise (₹50,000 = 5,000,000 paise)
   - Customer details (name, email, phone)
   - Callback URL
   - Notes (application_id, token)
4. Save link to database
5. Redirect to Razorpay's secure payment page

### 4. User Completes Payment

User pays on Razorpay's hosted page:
- Multiple payment methods supported (UPI, Cards, Net Banking, Wallets)
- PCI DSS compliant (we never handle card details)
- OTP verification for cards
- Real-time payment confirmation

### 5. Webhook Processing

Razorpay sends webhook after payment:
1. Verify webhook signature (prevents tampering)
2. Extract payment details
3. Update database:
   - `payment_status` = "paid"
   - `payment_at` = current timestamp
   - `payment_method` = method used
   - Add to `payment_history` array
   - Mark token as used
4. Return 200 OK to Razorpay

### 6. Callback Redirect

After payment, Razorpay redirects user to:
```
https://yourdomain.com/payment/callback?razorpay_payment_id=pay_xxx&razorpay_payment_link_id=plink_xxx&razorpay_payment_link_status=paid
```

Callback page shows success message.

## Security Features

### 1. Token Security
- **256-bit random tokens**: Cryptographically secure
- **Expiry**: 7 days validity
- **Single-use**: Token marked as used after payment
- **Database storage**: Tokens stored with user data

### 2. Webhook Verification
```typescript
const signature = crypto
  .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
  .update(rawBody)
  .digest("hex");

if (signature !== receivedSignature) {
  return 400; // Invalid signature
}
```

### 3. Amount Verification
- Amount stored with token
- Cannot be tampered with
- Verified before creating payment link

### 4. PCI Compliance
- No card data stored in your database
- All payment data handled by Razorpay
- HTTPS enforced for all payment pages

## Testing

### 1. Local Testing (without real payments)

Set test credentials:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=test_secret
```

### 2. Razorpay Test Mode

Use Razorpay test cards:
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: Any 6 digits

### 3. Webhook Testing

Use ngrok to expose localhost for webhook testing:
```bash
ngrok http 3000
```

Configure webhook URL in Razorpay Dashboard:
```
https://your-ngrok-url.ngrok.io/api/razorpay/webhook
```

## Production Setup

### 1. Razorpay Configuration

1. **Create Razorpay Account**: https://dashboard.razorpay.com/signup
2. **Complete KYC**: Required for live payments
3. **Get Credentials**:
   - Go to Settings → API Keys
   - Generate Live API Key ID and Secret
4. **Set Webhook**:
   - Go to Settings → Webhooks
   - Add webhook: `https://yourdomain.com/api/razorpay/webhook`
   - Select events: `payment_link.paid`, `payment.failed`, `payment.captured`
   - Set webhook secret

### 2. Environment Variables

Update `.env.local` with live credentials:
```env
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=live_secret_xxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
APP_BASE_URL=https://yourdomain.com
```

### 3. SSL/HTTPS

- Razorpay requires HTTPS for webhooks in production
- Use Vercel/Netlify (auto HTTPS) or configure SSL certificates

### 4. Monitoring

Monitor payment status:
1. Check Razorpay Dashboard for payment logs
2. Check Supabase `payment_history` for webhook logs
3. Check server logs for errors

## Troubleshooting

### Payment Link Not Created

**Check**:
1. Razorpay credentials in `.env.local`
2. Token is valid and not expired
3. User hasn't already paid
4. Server logs for Razorpay API errors

### Webhook Not Received

**Check**:
1. Webhook URL is publicly accessible
2. Webhook secret matches in Razorpay Dashboard
3. HTTPS is enabled (required in production)
4. Check Razorpay Dashboard → Webhooks → Logs

### Payment Successful but Status Not Updated

**Check**:
1. Webhook signature verification
2. Application ID in payment notes
3. Database update permissions
4. Server logs for webhook processing errors

### Token Expired Error

**Solution**:
- Tokens expire after 7 days
- Admin needs to re-approve to generate new token
- Or modify token expiry in approval API

## Common Issues

### 1. "Missing Razorpay credentials"

**Fix**: Add to `.env.local`:
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret
```

### 2. "Invalid or expired payment link"

**Reasons**:
- Token expired (>7 days old)
- Token already used
- Token not found in database

**Fix**: Admin needs to re-approve application

### 3. "Payment provider error"

**Reasons**:
- Invalid Razorpay credentials
- Amount is 0 or invalid
- Razorpay API is down

**Fix**: Check Razorpay Dashboard and server logs

### 4. Webhook signature mismatch

**Fix**: Ensure `RAZORPAY_WEBHOOK_SECRET` matches Razorpay Dashboard

## Support

For issues:
1. Check server logs: `npm run dev` output
2. Check Razorpay Dashboard logs
3. Check Supabase `payment_history` column
4. Contact: helpdesk@neram.co.in

## Additional Features

### Future Enhancements

Potential improvements:
- [ ] Partial payment support (installments)
- [ ] Automatic payment reminders
- [ ] Receipt generation and email
- [ ] Refund processing
- [ ] Payment analytics dashboard
- [ ] Multiple currency support
- [ ] Subscription/recurring payments

### Customization

You can customize:
- Token expiry duration (currently 7 days)
- Payment link expiry
- Email templates
- Success/error page designs
- Webhook event handling
