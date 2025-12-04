# 🔴 URGENT: Fix 403 Forbidden Error

## The Problem
Your CSV import is failing with a **403 Forbidden** error because your user account doesn't have the required **admin** role.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Go to Supabase SQL Editor
1. Open your **Supabase Dashboard**
2. Click **SQL Editor** in the left menu
3. Click **New Query**

### Step 2: Run This SQL Command
```sql
-- Replace 'your-email@example.com' with the email you use to sign in
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb
WHERE email = 'your-email@example.com';
```

**Example:**
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb
WHERE email = 'haribabu@example.com';
```

### Step 3: Sign Out & Sign In
1. In your app, click **Sign Out**
2. **Sign in again** with the same account
3. Go to `/exam-centers` page
4. Click **Import CSV** → **Download Template**
5. ✅ It should work now!

---

## 🔍 Verify Your Roles

Visit: **http://localhost:3000/debug-auth**

This page will show:
- ✅ Your current roles
- ✅ Whether you have admin access
- ✅ API test results
- ✅ SQL command with your email pre-filled

---

## 🎯 What Changed

I've updated the API to return **proper JSON error messages** instead of plain text:

**Before:**
```
403 Forbidden (plain text)
```

**After:**
```json
{
  "error": "Forbidden - Admin access required",
  "userRoles": ["student"],
  "message": "You need 'admin' or 'super_admin' role"
}
```

This will help you see exactly what roles you have and what's missing.

---

## 📋 Files Modified

1. ✅ `app/api/exam-centers/route.ts` - Fixed auth response to return JSON
2. ✅ `app/api/exam-centers/[id]/route.ts` - Fixed auth response to return JSON
3. ✅ Created `FIXING_403_ERROR.md` - Detailed troubleshooting guide
4. ✅ Created `supabase/migrations/assign_admin_role.sql` - SQL commands
5. ✅ Created `app/(protected)/debug-auth/page.tsx` - Debug tool

---

## 🔥 Alternative: Temporary Disable Auth (Development Only)

If you just want to test quickly, you can temporarily disable auth:

**File**: `app/api/exam-centers/route.ts`

Find the `checkAuth` function and change it to:

```typescript
async function checkAuth(request: NextRequest) {
  // TEMPORARY - Skip auth for development
  return { authorized: true };
}
```

**⚠️ WARNING**: Don't forget to restore the original code before production!

---

## 🎯 Expected Result After Fix

Once you have admin role assigned:

1. ✅ **Download Template** - Works perfectly
2. ✅ **Upload CSV** - No errors
3. ✅ **Edit Data Inline** - Full functionality
4. ✅ **Import to Database** - Successful
5. ✅ **Create/Edit/Delete** - All operations work

---

## 🆘 Still Having Issues?

1. **Check browser console** (F12 → Network tab)
2. **Look for the 403 response** - it now shows your current roles
3. **Visit `/debug-auth`** to see your session details
4. **Clear browser cache** and cookies
5. **Try a different browser** (incognito mode)

---

## 📞 Need More Help?

The error response now includes helpful debug info:

```json
{
  "error": "Forbidden - Admin access required",
  "userRoles": ["your", "current", "roles"],  
  "message": "You need 'admin' or 'super_admin' role"
}
```

Check the Network tab in browser DevTools to see what roles you currently have!

---

**Created**: December 4, 2025  
**Status**: Ready to Fix ✅
