# Quick Reference - Production Setup for admin.neramclasses.com

## Environment Variables (Copy to Vercel)

```env
# Update these specific URLs for your domain:
NEXTAUTH_URL=https://admin.neramclasses.com
APP_BASE_URL=https://admin.neramclasses.com

# Update these email addresses:
AZ_SENDER_USER=noreply@neramclasses.com
ADMIN_ALLOWED_EMAILS=admin@neramclasses.com
HELP_DESK_EMAIL=helpdesk@neramclasses.com

# Keep all other variables from your local .env.local:
AZURE_AD_TENANT_ID=<from .env.local>
AZURE_AD_CLIENT_ID=<from .env.local>
AZURE_AD_CLIENT_SECRET=<from .env.local>
AZ_TENANT_ID=<same as AZURE_AD_TENANT_ID>
AZ_CLIENT_ID=<same as AZURE_AD_CLIENT_ID>
AZ_CLIENT_SECRET=<same as AZURE_AD_CLIENT_SECRET>
NEXTAUTH_SECRET=<from .env.local>
NEXT_PUBLIC_SUPABASE_URL=<from .env.local>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from .env.local>
RAZORPAY_KEY_ID=<from .env.local>
RAZORPAY_KEY_SECRET=<from .env.local>
RAZORPAY_WEBHOOK_SECRET=<from .env.local>
PAYMENT_TOKEN_SECRET=<from .env.local>
NODE_ENV=production
```

## Azure AD Update

**Add this redirect URI in Azure Portal:**
```
https://admin.neramclasses.com/api/auth/callback/azure-ad
```

## Razorpay Webhook URL

**Set this in Razorpay Dashboard:**
```
https://admin.neramclasses.com/api/razorpay/webhook
```

## DNS Configuration

**Add to your DNS provider (GoDaddy/Namecheap/Cloudflare):**

```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
TTL: Auto
```

## Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Add custom domain `admin.neramclasses.com` in Vercel
- [ ] Update DNS records
- [ ] Wait for DNS propagation (check: https://dnschecker.org)
- [ ] Update Azure AD redirect URI
- [ ] Configure Razorpay webhook
- [ ] Redeploy in Vercel
- [ ] Test sign-in
- [ ] Test class request approval
- [ ] Test payment flow

## Important URLs

| Purpose | URL |
|---------|-----|
| Admin Portal | https://admin.neramclasses.com |
| Sign In | https://admin.neramclasses.com/api/auth/signin |
| Class Requests | https://admin.neramclasses.com/class-requests |

## Test After Deployment

1. Sign in with Microsoft account
2. View class requests
3. Approve a request (check email sent)
4. Test payment link from email
5. Complete payment on Razorpay
6. Verify webhook updates database

---

**For detailed instructions, see [PRODUCTION_CONFIG.md](PRODUCTION_CONFIG.md)**
