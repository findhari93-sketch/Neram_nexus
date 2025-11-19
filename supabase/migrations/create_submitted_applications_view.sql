-- Create a view that exposes application_submitted as a proper boolean column
-- This makes server-side filtering much more reliable and efficient

CREATE OR REPLACE VIEW public.submitted_applications AS
SELECT 
  u.*,
  -- Extract application_submitted as a computed boolean column
  CASE 
    WHEN (u.application_details->>'application_submitted') = 'true' THEN true
    WHEN (u.application_details->'application_submitted')::text = 'true' THEN true
    ELSE false
  END AS is_application_submitted
FROM public.users_duplicate u
WHERE 
  -- Only include rows where application was actually submitted
  (u.application_details->>'application_submitted') = 'true'
  OR (u.application_details->'application_submitted')::text = 'true';

-- Grant SELECT permissions (adjust these based on your RLS policies)
GRANT SELECT ON public.submitted_applications TO anon;
GRANT SELECT ON public.submitted_applications TO authenticated;
GRANT SELECT ON public.submitted_applications TO service_role;

-- Add helpful comment
COMMENT ON VIEW public.submitted_applications IS 
'Filtered view showing only users who have submitted their applications. 
Includes all columns from users_duplicate plus a computed is_application_submitted boolean.';