# Azure AD Role Assignment for Exam Centers

## Issue
You're signed in with Microsoft Entra ID (Azure AD) as **super_admin**, but getting a 403 Forbidden error when accessing exam centers because the API wasn't checking the correct role field.

## What I Fixed ✅

The API was checking `session.user.roles` (array), but Azure AD stores the mapped role as a **single string** in `session.user.role`.

### Updated Files:
1. ✅ `app/api/exam-centers/route.ts` - Now checks both `role` and `roles`
2. ✅ `app/api/exam-centers/[id]/route.ts` - Now checks both `role` and `roles`
3. ✅ `app/(protected)/debug-auth/page.tsx` - Shows Azure AD role structure

### New Auth Check:
```typescript
const userRole = (session.user as any).role;  // Primary role (string)
const userRoles = (session.user as any).roles || [];  // Azure roles array

const isAdmin =
  userRole === "admin" ||
  userRole === "super_admin" ||
  userRoles.includes("admin") ||
  userRoles.includes("super_admin");
```

---

## How Azure AD Roles Work in This App

### Role Mapping (from `lib/auth-config.ts`)
```typescript
AZURE_ROLE_MAPPINGS = {
  "SuperAdmin.AccessAll": "super_admin",  // Your current role
  "Admin": "admin",
  "Teacher": "teacher",
  "Student": "student",
}
```

### Your Session Structure:
```javascript
session.user = {
  email: "your-email@example.com",
  role: "super_admin",  // ← Mapped from Azure "SuperAdmin.AccessAll"
  roles: ["SuperAdmin.AccessAll"],  // ← Original Azure roles
  tenantId: "your-tenant-id"
}
```

---

## Verify Your Role Assignment

### Option 1: Use Debug Page
Visit: **http://localhost:3000/debug-auth**

This will show:
- ✅ Your primary role (from Azure AD)
- ✅ All Azure roles array
- ✅ Whether you have admin access
- ✅ API test results

### Option 2: Check Browser Console
```javascript
// In browser console
fetch('/api/auth/session')
  .then(r => r.json())
  .then(d => console.log(d))
```

Look for:
```json
{
  "user": {
    "role": "super_admin",  // This should be admin or super_admin
    "roles": ["SuperAdmin.AccessAll"]
  }
}
```

---

## If You Still Get 403 Error

### 1. Check Your Azure AD App Role Assignment

**Azure Portal** → **Azure Active Directory** → **Enterprise applications** → Your App

1. Click **Users and groups**
2. Find your user
3. Check **Assigned Role** column
4. Should show: **SuperAdmin.AccessAll** or **Admin**

### 2. Verify App Roles are Defined

**Azure Portal** → **App registrations** → Your App → **App roles**

Ensure these roles exist:
- `SuperAdmin.AccessAll` (value: SuperAdmin.AccessAll)
- `Admin` (value: Admin)
- `Teacher` (value: Teacher)
- `Student` (value: Student)

### 3. Sign Out and Sign In Again

After any role changes in Azure:
1. Sign out from your app
2. Clear browser cookies (optional but recommended)
3. Sign in again
4. Check `/debug-auth` to verify new role

---

## Azure AD App Roles Manifest Example

If roles are missing, add them to your app manifest:

```json
{
  "appRoles": [
    {
      "allowedMemberTypes": ["User"],
      "description": "Super Admin - Full system access",
      "displayName": "Super Admin",
      "id": "unique-guid-1",
      "isEnabled": true,
      "lang": null,
      "origin": "Application",
      "value": "SuperAdmin.AccessAll"
    },
    {
      "allowedMemberTypes": ["User"],
      "description": "Admin - Manage exam centers",
      "displayName": "Admin",
      "id": "unique-guid-2",
      "isEnabled": true,
      "lang": null,
      "origin": "Application",
      "value": "Admin"
    }
  ]
}
```

---

## Testing After Fix

1. **Refresh your browser** (the API fix is now live)
2. Visit `/exam-centers`
3. Click **Import CSV**
4. Click **Download Template**
5. ✅ Should work now!

---

## Error Response Structure

If you still get 403, the error now shows:

```json
{
  "error": "Forbidden - Admin access required",
  "currentRole": "student",  // Your mapped role
  "userRoles": ["Student"],  // Your Azure roles
  "message": "You need 'admin' or 'super_admin' role"
}
```

This helps debug role mapping issues.

---

## Quick Checklist

- ✅ App roles defined in Azure AD
- ✅ User assigned to SuperAdmin or Admin role in Enterprise App
- ✅ Signed out and signed in after role assignment
- ✅ `session.user.role` shows "super_admin" or "admin"
- ✅ API checks both `role` and `roles` fields

---

**Status**: Fixed! The API now correctly checks Azure AD roles. Just refresh your browser and try again! 🚀
