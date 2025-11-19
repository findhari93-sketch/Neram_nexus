# Authentication Troubleshooting Guide

## Error: "Callback" Error on Sign In

If you see an error like:
```
https://admin.neramclasses.com/auth/signin?callbackUrl=...&error=Callback
```

This means Azure AD successfully authenticated you, but the callback to your application failed.

---

## Fix 1: Verify Azure AD Redirect URIs

### In Azure Portal:

1. Go to **Azure Portal** → **Azure Active Directory** → **App Registrations**
2. Select your application: **Neram Classes only - Single tenant**
3. Click **Authentication** (left sidebar)
4. Under **Redirect URIs**, ensure you have:
   ```
   https://admin.neramclasses.com/api/auth/callback/azure-ad
   ```

### Important:
- ✅ **DO** include the production redirect URI
- ❌ **DON'T** use `http://` (must be `https://`)
- ❌ **DON'T** add trailing slashes
- ❌ **REMOVE** localhost URIs for production security:
  - `http://localhost:3000`
  - `http://localhost:3000/api/auth/callback/azure-ad`

### After updating:
1. Click **Save**
2. Wait 2-3 minutes for changes to propagate
3. Try signing in again

---

## Fix 2: Verify Vercel Environment Variables

### In Vercel Dashboard:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Verify these variables are set **exactly** as shown:

```env
NEXTAUTH_URL=https://admin.neramclasses.com
APP_BASE_URL=https://admin.neramclasses.com

AZURE_AD_TENANT_ID=<your-tenant-id>
AZURE_AD_CLIENT_ID=<your-client-id>
AZURE_AD_CLIENT_SECRET=<your-client-secret>
```

### Common mistakes:
- ❌ Missing `https://`
- ❌ Trailing slash: `https://admin.neramclasses.com/`
- ❌ Wrong domain
- ❌ Using Vercel URL instead of custom domain
- ❌ Variables not set to "Production" environment

### After updating:
1. Click **Save**
2. Go to **Deployments** tab
3. Click **•••** on latest deployment → **Redeploy**
4. Wait for deployment to complete
5. Try signing in again

---

## Fix 3: Check Azure AD Application Settings

### Client Secret:

1. Go to **Azure Portal** → **App Registrations** → Your App
2. Click **Certificates & secrets**
3. Check if your client secret has **expired**
4. If expired or missing:
   - Click **New client secret**
   - Add description: "Production Secret"
   - Set expiration (recommend 24 months)
   - Click **Add**
   - **Copy the VALUE immediately** (it won't be shown again)
5. Update `AZURE_AD_CLIENT_SECRET` in Vercel with the new value
6. Redeploy

### API Permissions:

Ensure these permissions are granted:
- `User.Read` (Delegated) - **Required**
- `openid` (Delegated) - **Required**
- `profile` (Delegated) - **Required**
- `email` (Delegated) - **Required**
- `offline_access` (Delegated) - **Required**

---

## Fix 4: Clear Browser Cache & Cookies

Sometimes old authentication cookies cause issues:

1. Open browser **Developer Tools** (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Under **Cookies**, delete all cookies for:
   - `https://admin.neramclasses.com`
   - `https://login.microsoftonline.com`
4. Close all browser tabs
5. Open a new incognito/private window
6. Try signing in again

---

## Fix 5: Verify DNS & SSL

### Check DNS:
```bash
# In terminal or command prompt:
nslookup admin.neramclasses.com
```

Should return Vercel's IP addresses.

### Check SSL Certificate:
1. Visit: https://admin.neramclasses.com
2. Click the **padlock** icon in browser address bar
3. Verify certificate is valid and issued for `admin.neramclasses.com`

If DNS or SSL issues:
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Check domain status
3. If not verified, follow Vercel's instructions to update DNS

---

## Fix 6: Check Vercel Function Logs

To see the actual error:

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on the latest deployment
3. Click **Functions** tab
4. Look for `/api/auth/[...nextauth]` function
5. Check the logs for detailed error messages

Common errors in logs:
- `AZURE_AD_CLIENT_ID is not defined` → Missing environment variable
- `Invalid client secret` → Wrong or expired secret
- `redirect_uri_mismatch` → Azure AD redirect URI doesn't match
- `AADSTS50011` → Reply URL mismatch in Azure AD

---

## Fix 7: Test with a Different User

Sometimes the issue is user-specific:

1. Try signing in with a different Microsoft account
2. Ensure the test user is in your Azure AD tenant: **Neram Classes only - Single tenant**
3. If it works with another user, the original user may have:
   - Account locked or disabled
   - Missing permissions
   - Conflicting cached credentials

---

## Fix 8: Verify Tenant Configuration

From your screenshot, you're using:
- **Tenant Type**: Single tenant
- **Organization**: Neram Classes only

Ensure:
1. Users signing in belong to the correct Azure AD tenant
2. In Azure AD → **Enterprise Applications** → Your App:
   - **User assignment required?** Check this setting
   - If enabled, users must be explicitly assigned to the app
3. To assign users:
   - Click **Users and groups**
   - Click **Add user/group**
   - Select users who should have access

---

## Still Not Working?

### Collect Debug Information:

1. **From Browser Console** (F12 → Console tab):
   ```javascript
   // Copy any error messages
   ```

2. **From Vercel Function Logs**:
   - Copy the full error stack trace

3. **From Azure AD Sign-in Logs**:
   - Go to Azure Portal → Azure AD → **Sign-in logs**
   - Find your recent sign-in attempt
   - Check the status and error details

### Quick Test Checklist:

- [ ] Redirect URI in Azure AD: `https://admin.neramclasses.com/api/auth/callback/azure-ad`
- [ ] NEXTAUTH_URL in Vercel: `https://admin.neramclasses.com`
- [ ] APP_BASE_URL in Vercel: `https://admin.neramclasses.com`
- [ ] Azure AD Client ID is correct
- [ ] Azure AD Client Secret is valid and not expired
- [ ] Azure AD Tenant ID is correct
- [ ] All environment variables are set to "Production" in Vercel
- [ ] Redeployed after changing environment variables
- [ ] Removed localhost redirect URIs from Azure AD
- [ ] DNS points to Vercel correctly
- [ ] SSL certificate is valid

---

## Alternative: Use Incognito Mode for Testing

This eliminates cookie/cache issues:

1. Open **Incognito/Private browsing** window
2. Go to: https://admin.neramclasses.com/auth/signin
3. Click "Sign in with Microsoft"
4. Complete authentication

If it works in incognito but not regular browser:
- Clear all cookies and cache in regular browser
- Close all browser windows
- Restart browser

---

## Contact Support

If you've tried all fixes above and still can't sign in:

**Provide these details:**
- Full error URL (including the `error=` parameter)
- Screenshot of Azure AD redirect URI configuration
- Screenshot of Vercel environment variables (hide secrets)
- Browser console errors (F12 → Console)
- Vercel function logs for the auth callback

---

## Prevention

To avoid this error in the future:

1. **Always redeploy** after changing environment variables
2. **Test in incognito mode** after making Azure AD changes
3. **Keep client secrets valid** - set calendar reminders before expiry
4. **Document your configuration** - save redirect URIs, environment variables
5. **Use separate Azure AD apps** for dev and production (optional but recommended)
