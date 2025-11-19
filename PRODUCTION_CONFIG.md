# Production Configuration for admin.neramclasses.com

This guide covers all configuration changes needed to deploy your application to production using the domain `admin.neramclasses.com`.

## 1. Environment Variables for Production

In **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**, set these values:

```env
# Azure AD Authentication
AZURE_AD_TENANT_ID=your-tenant-id-from-azure-portal
AZURE_AD_CLIENT_ID=your-client-id-from-azure-portal
AZURE_AD_CLIENT_SECRET=your-client-secret-from-azure-portal

# Azure AD for Email Sending (same values as above)
AZ_TENANT_ID=your-tenant-id-from-azure-portal
AZ_CLIENT_ID=your-client-id-from-azure-portal
AZ_CLIENT_SECRET=your-client-secret-from-azure-portal
AZ_SENDER_USER=noreply@neramclasses.com

# Email Configuration
ADMIN_ALLOWED_EMAILS=admin@neramclasses.com,youremail@example.com
HELP_DESK_EMAIL=helpdesk@neramclasses.com

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://admin.neramclasses.com

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-live-secret
RAZORPAY_WEBHOOK_SECRET=neram_webhook_secret_2025

# Application URLs
APP_BASE_URL=https://admin.neramclasses.com

# Payment Token Security
PAYMENT_TOKEN_SECRET=your-payment-token-secret-here

# Environment
NODE_ENV=production
```

### How to Generate Secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate PAYMENT_TOKEN_SECRET
openssl rand -hex 64
```

---

## 2. Azure AD Configuration

### Update Redirect URIs in Azure Portal:

1. Go to **Azure Portal** → **Azure Active Directory** → **App Registrations**
2. Select your application
3. Click **Authentication**
4. Under **Redirect URIs**, add:
   ```
   https://admin.neramclasses.com/api/auth/callback/azure-ad
   ```
5. **Remove** any localhost URIs for production security
6. Click **Save**

### Verify API Permissions:

Ensure these permissions are granted:
- `User.Read` (Delegated)
- `Mail.Send` (Application)

---

## 3. Razorpay Webhook Configuration

### Setup Webhook in Razorpay Dashboard:

1. Go to **Razorpay Dashboard** → **Settings** → **Webhooks**
2. Click **Add Webhook URL**
3. Configure:
   - **URL**: `https://admin.neramclasses.com/api/razorpay/webhook`
   - **Secret**: `neram_webhook_secret_2025`
   - **Active Events**: Select all payment events:
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
     - `payment_link.paid`
     - `payment_link.expired`
   - **Status**: ✅ Active
4. Click **Save**

---

## 4. Domain Configuration in Vercel

### Add Custom Domain:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `admin.neramclasses.com`
4. Vercel will provide DNS records to configure

### Configure DNS Records:

Add these records in your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare):

**For CNAME (recommended):**
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

**Or for A Record:**
```
Type: A
Name: admin
Value: 76.76.21.21
```

### SSL Certificate:

Vercel automatically provisions and renews SSL certificates. No action needed.

---

## 5. Supabase Configuration

### Update CORS Settings:

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **API**
2. Under **CORS Settings**, add:
   ```
   https://admin.neramclasses.com
   ```

### Verify RLS Policies:

Ensure Row Level Security policies are enabled for production:
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users_duplicate';
```

---

## 6. Code Changes Required

No code changes are needed! The application already uses environment variables for all URLs:

### Files that auto-configure from environment:

- `app/api/pay/route.ts` - Uses `APP_BASE_URL` from env
- `app/api/applications/approve/route.ts` - Uses `APP_BASE_URL` from env
- `lib/auth.ts` - Uses `NEXTAUTH_URL` from env
- All API routes use environment variables

---

## 7. Deployment Steps

### Initial Deployment:

1. **Push code to GitHub** (already done)
2. **Connect Vercel to GitHub repository**
3. **Import project in Vercel**
4. **Add all environment variables** (from section 1)
5. **Deploy**
6. **Add custom domain** `admin.neramclasses.com`
7. **Update DNS records** at your registrar
8. **Wait for DNS propagation** (5 minutes - 24 hours)
9. **Redeploy** after DNS is active to ensure all URLs update

### Post-Deployment:

```bash
# After first deployment, update these in Vercel env vars:
NEXTAUTH_URL=https://admin.neramclasses.com
APP_BASE_URL=https://admin.neramclasses.com

# Then redeploy
```

---

## 8. Testing Checklist

After deployment, test these features:

### Authentication:
- [ ] Sign in with Microsoft account works
- [ ] User profile displays correctly
- [ ] Sign out works
- [ ] Unauthorized users redirected properly

### Class Requests:
- [ ] View class requests list
- [ ] View request details
- [ ] Approve request
- [ ] Reject request
- [ ] Approval email sent with correct domain

### Payments:
- [ ] Payment link in email works
- [ ] Redirects to Razorpay
- [ ] Razorpay webhook received
- [ ] Payment status updates in database
- [ ] Success page displays
- [ ] Error handling works

### URLs to Test:
- https://admin.neramclasses.com
- https://admin.neramclasses.com/class-requests
- https://admin.neramclasses.com/api/auth/signin

---

## 9. Monitoring & Logs

### Vercel Logs:
- **Vercel Dashboard** → Your Project → **Deployments** → Click deployment → **Function Logs**

### Check for errors:
```bash
# Common issues to monitor:
- Authentication failures
- Email sending errors
- Payment webhook failures
- Database connection issues
```

### Razorpay Logs:
- **Razorpay Dashboard** → **Webhooks** → View delivery logs

### Supabase Logs:
- **Supabase Dashboard** → **Logs** → **API** tab

---

## 10. Security Checklist

Production security recommendations:

- [ ] All secrets use strong random values
- [ ] `.env.local` never committed to Git
- [ ] Azure AD localhost redirects removed
- [ ] Supabase RLS policies enabled
- [ ] CORS configured for production domain only
- [ ] Razorpay webhook signature verified
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Environment variables set to "Production" scope in Vercel

---

## 11. Rollback Plan

If deployment has issues:

1. **Vercel Dashboard** → **Deployments**
2. Find previous working deployment
3. Click **•••** → **Promote to Production**

---

## 12. Support Contacts

- **Application Issues**: helpdesk@neramclasses.com
- **Vercel Support**: https://vercel.com/support
- **Azure Support**: Azure Portal
- **Razorpay Support**: https://razorpay.com/support/

---

## Summary of Critical URLs

| Service | Production URL |
|---------|---------------|
| **Application** | https://admin.neramclasses.com |
| **Sign In** | https://admin.neramclasses.com/api/auth/signin |
| **Azure Redirect** | https://admin.neramclasses.com/api/auth/callback/azure-ad |
| **Razorpay Webhook** | https://admin.neramclasses.com/api/razorpay/webhook |
| **Payment Link** | https://admin.neramclasses.com/api/pay?v=TOKEN |
| **Payment Callback** | https://admin.neramclasses.com/payment/callback |

---

**Next Steps:**
1. Set environment variables in Vercel (Section 1)
2. Configure Azure AD redirect URIs (Section 2)
3. Setup Razorpay webhook (Section 3)
4. Add custom domain in Vercel (Section 4)
5. Update DNS records (Section 4)
6. Deploy and test (Section 8)
