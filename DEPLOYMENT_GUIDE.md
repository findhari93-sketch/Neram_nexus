# Deployment Guide - Neram Admin Nexus

This guide covers deploying your application to production using Vercel (recommended) or other platforms.

## Prerequisites

- [x] Code pushed to GitHub: https://github.com/findhari93-sketch/Neram_nexus.git
- [ ] Vercel account (free tier works)
- [ ] Azure AD app configured
- [ ] Razorpay account with KYC completed
- [ ] Supabase project set up
- [ ] Domain name (optional, Vercel provides one)

## Option 1: Deploy to Vercel (Recommended) ⭐

Vercel is optimized for Next.js and provides:
- Automatic HTTPS
- Global CDN
- Zero-config deployment
- Automatic GitHub integration
- Environment variable management

### Steps:

#### 1. Sign up for Vercel

1. Go to https://vercel.com/signup
2. Sign up with your GitHub account
3. Grant Vercel access to your repositories

#### 2. Import Project

1. Click "Add New..." → "Project"
2. Select your repository: `findhari93-sketch/Neram_nexus`
3. Click "Import"

#### 3. Configure Project

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: Leave as `.` (root)

**Build Command**: `npm run build` (auto-detected)

**Output Directory**: `.next` (auto-detected)

#### 4. Add Environment Variables

Click "Environment Variables" and add these:

```env
# Azure AD Authentication
# Get these from Azure Portal → App Registrations → Your App
AZURE_AD_TENANT_ID=your-tenant-id-here
AZURE_AD_CLIENT_ID=your-client-id-here
AZURE_AD_CLIENT_SECRET=your-client-secret-here

# Azure AD for Email Sending (same values as above)
AZ_TENANT_ID=your-tenant-id-here
AZ_CLIENT_ID=your-client-id-here
AZ_CLIENT_SECRET=your-client-secret-here
AZ_SENDER_USER=noreply@yourdomain.com

# Email Configuration
ADMIN_ALLOWED_EMAILS=admin@yourdomain.com,admin2@yourdomain.com
HELP_DESK_EMAIL=helpdesk@yourdomain.com

# NextAuth
# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Supabase
# Get these from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Razorpay
# Get these from Razorpay Dashboard → Settings → API Keys
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret-here
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret-here

# Application URLs
APP_BASE_URL=https://your-domain.vercel.app

# Payment Token Security
# Generate: openssl rand -hex 64
PAYMENT_TOKEN_SECRET=your-payment-token-secret-here

# Environment
NODE_ENV=production
```

**⚠️ Security Note**: Copy your actual values from your local `.env.local` file. Never commit secrets to Git!

**Important Notes:**
- Use "Production" environment for all variables
- `NEXTAUTH_URL` should be your actual Vercel URL (will be shown after first deployment)
- `APP_BASE_URL` should match your Vercel URL or custom domain

#### 5. Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

#### 6. Update Environment Variables

After first deployment:
1. Note your Vercel URL
2. Go to Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` and `APP_BASE_URL` with your actual URL
4. Redeploy: Deployments → Click "..." → Redeploy

#### 7. Configure Azure AD Redirect

1. Go to Azure Portal → App Registrations → Your App
2. Click "Authentication"
3. Add Redirect URI: `https://your-vercel-url.vercel.app/api/auth/callback/azure-ad`
4. Save

#### 8. Configure Razorpay Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Click "Add Webhook URL"
3. URL: `https://your-vercel-url.vercel.app/api/razorpay/webhook`
4. Secret: `neram_webhook_secret_2025`
5. Events: Select all payment events
6. Active: ✅
7. Save

### Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `admin.neramclasses.com`)
3. Update DNS records as instructed
4. Vercel will automatically provision SSL certificate
5. Update environment variables with new domain

---

## Option 2: Deploy to Other Platforms

### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables
5. Deploy

### AWS Amplify

1. Connect GitHub repository
2. Build settings: Auto-detected for Next.js
3. Add environment variables
4. Deploy

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy (auto-detected Next.js)

---

## Post-Deployment Checklist

### 1. Test Authentication

- [ ] Can sign in with Microsoft account
- [ ] User profile shows correctly
- [ ] Sign out works
- [ ] Redirects work properly

### 2. Test Class Requests

- [ ] Can view class requests list
- [ ] Can open detail page
- [ ] Can approve/reject requests
- [ ] Approval email received

### 3. Test Payment Flow

- [ ] Click "Razor Pay" in approval email
- [ ] Redirects to Razorpay
- [ ] Complete test payment
- [ ] Webhook received and processed
- [ ] Payment status updated in database
- [ ] Redirect to success page

### 4. Test Email Sending

- [ ] Approval emails sent
- [ ] Rejection emails sent
- [ ] Payment links work
- [ ] Email formatting correct

### 5. Monitor Logs

Check Vercel logs for:
- [ ] No build errors
- [ ] No runtime errors
- [ ] API routes working
- [ ] Webhook events processed

---

## Troubleshooting

### Build Fails

**Check:**
1. All environment variables are set
2. No TypeScript errors: `npm run build` locally
3. Dependencies installed: `package.json` is correct
4. Node version: Use Node 18+ (set in Vercel Project Settings)

**Fix:**
- Check build logs in Vercel dashboard
- Run `npm run build` locally to reproduce
- Fix errors and push to GitHub

### Authentication Not Working

**Check:**
1. `NEXTAUTH_URL` matches your deployment URL
2. Azure AD redirect URI is configured
3. `NEXTAUTH_SECRET` is set
4. `AZURE_AD_*` credentials are correct

**Fix:**
- Update Azure AD redirect URI
- Verify environment variables
- Check browser console for errors

### Email Not Sending

**Check:**
1. `AZ_*` credentials are correct
2. `AZ_SENDER_USER` email exists in Azure AD
3. Mail.Send permission granted in Azure AD
4. Check Vercel function logs

**Fix:**
- Verify Azure AD app permissions
- Check server logs for Graph API errors
- Test with different email address

### Payments Not Working

**Check:**
1. Razorpay webhook URL is correct
2. Webhook secret matches
3. Live API keys are used (not test)
4. Razorpay KYC completed
5. Check Vercel function logs

**Fix:**
- Verify webhook URL and secret
- Check Razorpay Dashboard webhook logs
- Test with Razorpay test mode first

### Database Errors

**Check:**
1. Supabase credentials correct
2. Database tables exist
3. RLS policies configured
4. Service role key used for API routes

**Fix:**
- Verify Supabase URL and keys
- Check Supabase logs
- Review RLS policies

---

## Monitoring

### Vercel Analytics

- View deployment analytics in Vercel dashboard
- Monitor function execution times
- Track errors and logs

### Razorpay Dashboard

- Monitor payments in real-time
- View webhook delivery status
- Download payment reports

### Supabase Dashboard

- Monitor database queries
- View API usage
- Check for errors

### Azure AD Logs

- Sign-in logs: Azure Portal → Azure AD → Sign-in logs
- App usage: Azure AD → Enterprise Applications → Your App

---

## Updating Your Application

### Deploy Updates

1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
4. Vercel auto-deploys from `main` branch
5. Monitor deployment in Vercel dashboard

### Rollback

If deployment has issues:
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

---

## Security Best Practices

### Environment Variables

- [ ] Never commit `.env.local` to GitHub
- [ ] Use different secrets for dev/prod
- [ ] Rotate secrets periodically
- [ ] Use Vercel's encrypted environment variables

### API Security

- [ ] All API routes authenticated
- [ ] Webhook signatures verified
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured

### Database

- [ ] Row Level Security (RLS) enabled
- [ ] Service role key only in server-side code
- [ ] Regular backups configured
- [ ] Audit logs enabled

---

## Performance Optimization

### Vercel Recommendations

1. Enable caching headers
2. Use Image Optimization (Next.js Image component)
3. Implement ISR for static pages
4. Use Edge Functions for global distribution

### Database

1. Add indexes for frequent queries
2. Use database connection pooling
3. Implement query caching
4. Monitor slow queries

---

## Cost Estimation

### Vercel (Hobby Plan - Free)

- **Included**: 100GB bandwidth, unlimited deployments
- **Limits**: 1 concurrent build, 100GB-hrs serverless execution
- **Upgrade to Pro**: $20/month for higher limits

### Supabase (Free Tier)

- **Included**: 500MB database, 1GB file storage, 2GB bandwidth
- **Upgrade to Pro**: $25/month for 8GB database

### Razorpay

- **Transaction Fee**: 2% per transaction (standard in India)
- **No monthly fee**: Pay only for transactions

### Azure AD (Free)

- **Included**: 50,000 monthly authentications
- **No cost** for this use case

---

## Support

For deployment issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Vercel support: https://vercel.com/support
3. GitHub Issues: https://github.com/findhari93-sketch/Neram_nexus/issues

For application issues:
- Email: helpdesk@neram.co.in
- Check application logs in Vercel
- Review documentation in repository

---

## Success Criteria

Your deployment is successful when:

- ✅ Application accessible at public URL
- ✅ Users can sign in with Microsoft accounts
- ✅ Admins can approve/reject class requests
- ✅ Approval emails sent successfully
- ✅ Payment links work
- ✅ Payments processed and stored
- ✅ No console errors
- ✅ No server errors in logs

---

**Congratulations!** 🎉 Your Neram Admin Nexus is now deployed and ready for production use!
