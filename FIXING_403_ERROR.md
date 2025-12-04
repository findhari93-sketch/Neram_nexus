# Fixing 403 Forbidden Error - Admin Role Setup

## Problem
You're getting a **403 Forbidden** error when accessing the exam centers API because your user doesn't have the required `admin` or `super_admin` role.

## Solution

### Step 1: Assign Admin Role to Your User

Go to your **Supabase Dashboard** → **SQL Editor** and run one of these queries:

#### Option A: Assign admin role to yourself (recommended)
```sql
-- Replace 'your-email@example.com' with your actual login email
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb
WHERE email = 'your-email@example.com';
```

#### Option B: Assign admin role to all existing users (development only)
```sql
-- ONLY for development/testing - gives everyone admin access
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb;
```

#### Option C: Assign super_admin role (highest permission)
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["super_admin"]}'::jsonb
WHERE email = 'your-email@example.com';
```

### Step 2: Verify the Role Assignment

```sql
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_app_meta_data->'roles' as roles
FROM auth.users
WHERE email = 'your-email@example.com';
```

You should see output like:
```
roles: ["admin"]
```

### Step 3: Sign Out and Sign In Again

1. Click "Sign Out" in your app
2. Sign in again with the same credentials
3. The new role will be loaded in your session

### Step 4: Test the Exam Centers Page

1. Navigate to `/exam-centers`
2. Click "Import CSV" button
3. Click "Download Template"
4. The CSV file should download successfully

---

## How Roles Work in This App

The app uses **NextAuth** with role-based access control (RBAC):

- **Roles are stored** in `auth.users.raw_app_meta_data.roles` as a JSON array
- **Required roles** for exam centers: `admin` or `super_admin`
- **Roles are checked** in the API routes using `checkAuth()` function

### Role Hierarchy
1. `super_admin` - Full access to everything
2. `admin` - Manage exam centers, users, etc.
3. `teacher` - View and limited edits
4. `student` - View only

---

## Alternative: Disable Auth Check (Development Only)

If you want to test without authentication during development, you can temporarily disable the auth check:

**File**: `app/api/exam-centers/route.ts`

```typescript
// TEMPORARY - Remove this in production!
async function checkAuth(request: NextRequest) {
  // Skip auth check for development
  return { authorized: true };
  
  /* Original code:
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      ),
    };
  }
  
  const userRoles = (session.user as any).roles || [];
  const isAdmin =
    userRoles.includes("admin") || userRoles.includes("super_admin");

  if (!isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
  */
}
```

**⚠️ WARNING**: Remember to restore the original auth check before deploying to production!

---

## Troubleshooting

### Still Getting 403 After Role Assignment?

1. **Clear browser cache and cookies**
2. **Sign out and sign in again** (important!)
3. **Check browser console** - look for the error response
4. **Verify in Supabase Dashboard**:
   - Go to Authentication → Users
   - Click on your user
   - Check "App Metadata" section
   - Confirm `roles: ["admin"]` is present

### Error Response Shows Your Roles

After the fix I made, the 403 error now includes your current roles:

```json
{
  "error": "Forbidden - Admin access required",
  "userRoles": ["student"],  // Shows what roles you have
  "message": "You need 'admin' or 'super_admin' role"
}
```

Check the browser console (Network tab) to see what roles you currently have.

---

## Next Steps After Fixing Auth

Once you have admin access:

1. ✅ Download CSV template will work
2. ✅ Upload CSV will work
3. ✅ Edit data inline will work
4. ✅ Import to database will work
5. ✅ Create/Edit/Delete exam centers will work

The entire exam centers management system will be fully functional!
