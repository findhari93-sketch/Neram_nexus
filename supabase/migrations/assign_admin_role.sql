-- Assign Admin Role to User
-- Run this in your Supabase SQL Editor

-- Option 1: Assign admin role to a specific user by email
-- Replace 'your-email@example.com' with your actual email
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb
WHERE email = 'your-email@example.com';

-- Option 2: Assign admin role to all users (for development/testing only)
-- CAUTION: Only use this in development environment
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb;

-- Option 3: Create a specific admin user with email and role
-- Replace with your details
-- INSERT INTO auth.users (
--   email,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   email_confirmed_at,
--   created_at,
--   updated_at
-- ) VALUES (
--   'admin@example.com',
--   '{"provider": "email", "providers": ["email"], "roles": ["admin"]}'::jsonb,
--   '{}'::jsonb,
--   NOW(),
--   NOW(),
--   NOW()
-- );

-- Verify the roles were assigned
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_app_meta_data->'roles' as roles
FROM auth.users
WHERE email = 'your-email@example.com';
