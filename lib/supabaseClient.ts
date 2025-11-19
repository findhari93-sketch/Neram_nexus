import { createClient } from "@supabase/supabase-js";

// Uses public env vars so it can run both server and client side safely.
// Ensure you add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // We deliberately do not throw; components can surface a friendly message instead.
  // eslint-disable-next-line no-console
  console.warn(
    "[supabaseClient] Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(url || "", anon || "");

export type UsersDuplicateRow = {
  id?: number | null;
  // Basic
  student_name?: string | null;
  father_name?: string | null;
  gender?: string | null;

  // Contact Details
  city?: string | null;
  email?: string | null;
  phone?: string | null;
  state?: string | null;
  country?: string | null;
  zip_code?: string | null;

  // Education Details
  education_type?: string | null;
  board?: string | null;
  institute_name?: string | null;
  standard?: string | null;
  course?: string | null;
  completion_year?: string | number | null;

  // Application Details
  approved_at?: string | null;
  approved_by?: string | null;
  email_status?: string | null;
  email_sent_at?: string | null;
  application_submitted?: boolean | null;
  app_submitted_date_time?: string | null;
  application_admin_approval?: string | null;

  // Admin Filled
  discount?: string | null;
  admin_comment?: string | null;
  remaining_fees?: string | null;
  course_duration?: string | null;
  payment_options?: string | null;
  final_course_Name?: string | null;
  nata_attempt_year?: string | null;
  offer_before_date?: string | null;
  total_course_fees?: number | null;
  will_study_next_year?: string | null;
  second_installment_date?: string | null;
  final_fee_payment_amount?: number | null;
  first_installment_amount?: number | null;
  second_installment_amount?: number | null;
  // Final Fee Payment Details
  bank?: string | null;
  amount?: number | null;
  upi_id?: string | null;
  contact?: string | null;
  receipt?: string | null;
  currency?: string | null;
  order_id?: string | null;
  verified?: boolean | null;
  signature?: string | null;
  payment_at?: string | null;
  payment_id?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  installment_type?: string | null;

  // Account Details
  photo_url?: string | null;
  providers?: string[] | null;
  created_at?: string | null;
  account_type?: string | null;
  display_name?: string | null;
  firebase_uid?: string | null;
  last_sign_in?: string | null;
  phone_auth_used?: boolean | null;

  // legacy fields
  name?: string | null;
  role?: string | null;
};
