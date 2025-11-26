import { z } from "zod";

// Shared Zod schemas for validation
export const AccountSchema = z
  .object({
    photo_url: z.string().nullable().optional(),
    photoUrl: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    profile_image: z.string().nullable().optional(),
    profilePhoto: z.string().nullable().optional(),
    providers: z.any().optional(),
    created_at: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    account_type: z.string().nullable().optional(),
    display_name: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    firebase_uid: z.string().nullable().optional(),
    uid: z.string().nullable().optional(),
    last_sign_in: z.string().nullable().optional(),
    phone_auth_used: z.union([z.boolean(), z.string(), z.null()]).optional(),
    phone_verified: z.union([z.boolean(), z.string(), z.null()]).optional(),
  })
  .passthrough();

export const BasicSchema = z
  .object({
    student_name: z.string().nullable().optional(),
    studentName: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    full_name: z.string().nullable().optional(),
    father_name: z.string().nullable().optional(),
    fatherName: z.string().nullable().optional(),
    gender: z.string().nullable().optional(),
    sex: z.string().nullable().optional(),
    dob: z.string().nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
  })
  .passthrough();

export const ContactSchema = z
  .object({
    city: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    primary_email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    mobile: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    zip_code: z.string().nullable().optional(),
    zip: z.string().nullable().optional(),
  })
  .passthrough();

export const ApplicationSchema = z
  .object({
    application_submitted: z
      .union([z.boolean(), z.string(), z.null()])
      .optional(),
    submitted: z.union([z.boolean(), z.string(), z.null()]).optional(),
    is_submitted: z.union([z.boolean(), z.string(), z.null()]).optional(),
    app_submitted_date_time: z.string().nullable().optional(),
    submitted_at: z.string().nullable().optional(),
    submittedAt: z.string().nullable().optional(),
    application_admin_approval: z.any().optional(),
    approved_at: z.string().nullable().optional(),
    approved_by: z.any().optional(),
    email_status: z.string().nullable().optional(),
    email_sent_at: z.string().nullable().optional(),
  })
  .passthrough();

// Edit data validation schema for inline editing
export const EditDataSchema = z.object({
  student_name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .optional()
    .or(z.literal("")),
  father_name: z.string().min(1).max(100).optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number")
    .min(10, "Phone number too short")
    .max(20, "Phone number too long")
    .optional()
    .or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  zip_code: z.string().max(20).optional().or(z.literal("")),
  gender: z.string().max(20).optional().or(z.literal("")),
});

export type RawRow = Record<string, any>;

// Helper: parse a value that may be an object or a JSON string
export function parseMaybeJson(value: any, schema?: any) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object") {
    if (!schema) return value;
    const res = schema.safeParse(value);
    return res.success ? res.data : undefined;
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return undefined;
    try {
      const parsed = JSON.parse(s);
      if (!schema) return parsed;
      const res = schema.safeParse(parsed);
      return res.success ? res.data : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// Normalize account data
export function normalizeAccount(orig: RawRow, out: any) {
  let account: any | undefined;
  const accountSources: Array<[string, any]> = [
    ["account", orig.account],
    ["account_details", orig.account_details],
    ["account_info", orig.account_info],
    ["auth", orig.auth],
    ["provider_info", orig.provider_info],
  ];
  for (const [key, val] of accountSources) {
    if (val !== undefined && val !== null) {
      const parsed = parseMaybeJson(val, AccountSchema);
      if (parsed === undefined) {
        const fallbackParsed = parseMaybeJson(val);
        account = account ?? fallbackParsed;
        if (process.env.NODE_ENV === "development" && !fallbackParsed) {
          console.warn("Account data failed validation and parsing", {
            key,
            value: val,
          });
        }
      } else {
        account = account ?? parsed;
      }
    }
  }
  account = account ?? (typeof orig === "object" ? orig : undefined);

  if (!account) return;
  out.photo_url =
    out.photo_url ??
    account.photo_url ??
    account.photoUrl ??
    account.avatar ??
    account.image ??
    account.profile_image ??
    account.profilePhoto ??
    undefined;

  out.providers = out.providers ?? account.providers ?? account.provider;
  out.created_at = out.created_at ?? account.created_at ?? account.createdAt;
  out.last_sign_in =
    out.last_sign_in ??
    account.last_sign_in ??
    account.lastSignIn ??
    account.last_login;
  out.account_type = out.account_type ?? account.account_type ?? account.type;
  out.display_name = out.display_name ?? account.display_name ?? account.name;
  out.firebase_uid = out.firebase_uid ?? account.firebase_uid ?? account.uid;
  out.phone_auth_used =
    out.phone_auth_used ??
    account.phone_auth_used ??
    account.phone_verified ??
    false;
}

// Normalize basic data
export function normalizeBasic(orig: RawRow, out: any) {
  let basic: any | undefined;
  const basicSources: Array<[string, any]> = [
    ["basic", orig.basic],
    ["basic_info", orig.basic_info],
  ];
  for (const [key, val] of basicSources) {
    if (val !== undefined && val !== null) {
      const parsed = parseMaybeJson(val, BasicSchema);
      if (parsed === undefined && process.env.NODE_ENV === "development") {
        console.warn("Basic data failed validation", { key, value: val });
      }
      basic = basic ?? parsed;
    }
  }
  if (basic) {
    out.student_name =
      out.student_name ??
      basic.student_name ??
      basic.studentName ??
      basic.name ??
      basic.full_name ??
      basic.name ??
      undefined;
    out.father_name = out.father_name ?? basic.father_name ?? basic.fatherName;
    out.gender = out.gender ?? basic.gender ?? basic.sex;
    out.dob = out.dob ?? basic.dob ?? basic.date_of_birth;
  } else {
    // fall back to top-level fields
    out.student_name =
      out.student_name ?? orig.student_name ?? orig.display_name ?? orig.name;
    out.father_name = out.father_name ?? orig.father_name ?? orig.fatherName;
    out.gender = out.gender ?? orig.gender ?? orig.sex;
    out.dob = out.dob ?? orig.dob ?? orig.date_of_birth;
  }
}

// Normalize contact data
export function normalizeContact(orig: RawRow, out: any) {
  // Parse and store the nested contact object, then extract individual fields
  // to top-level keys for easier access in components
  let contact: any | undefined;
  const contactSources: Array<[string, any]> = [
    ["contact", orig.contact],
    ["contact_info", orig.contact_info],
  ];
  for (const [key, val] of contactSources) {
    if (val !== undefined && val !== null) {
      const parsed = parseMaybeJson(val, ContactSchema);
      if (parsed === undefined && process.env.NODE_ENV === "development") {
        console.warn("Contact data failed validation", { key, value: val });
      }
      contact = contact ?? parsed ?? val;
    }
  }

  if (contact !== undefined) {
    out.contact = out.contact ?? contact;
  }

  // Extract individual contact fields to top-level for easier access
  if (contact && typeof contact === "object") {
    out.email = out.email ?? contact.email ?? contact.primary_email;
    out.phone = out.phone ?? contact.phone ?? contact.mobile;
    out.city = out.city ?? contact.city;
    out.state = out.state ?? contact.state;
    out.country = out.country ?? contact.country;
    out.zip_code = out.zip_code ?? contact.zip_code ?? contact.zip;
  } else {
    // Fallback to top-level fields if contact object doesn't exist
    out.email = out.email ?? orig.email ?? orig.primary_email;
    out.phone = out.phone ?? orig.phone ?? orig.mobile;
    out.city = out.city ?? orig.city;
    out.state = out.state ?? orig.state;
    out.country = out.country ?? orig.country;
    out.zip_code = out.zip_code ?? orig.zip_code ?? orig.zip;
  }
}

// Normalize application data
export function normalizeApplication(orig: RawRow, out: any) {
  let app: any | undefined;
  const appSources: Array<[string, any]> = [
    ["application", orig.application],
    ["application_info", orig.application_info],
    ["application_details", orig.application_details],
    ["applicationDetails", orig.applicationDetails],
  ];
  for (const [key, val] of appSources) {
    if (val !== undefined && val !== null) {
      const parsed = parseMaybeJson(val, ApplicationSchema);
      if (parsed === undefined && process.env.NODE_ENV === "development") {
        console.warn("Application data failed validation", { key, value: val });
      }
      app = app ?? parsed;
    }
  }
  if (!app) {
    // Fallbacks to top-level
    out.application_submitted =
      out.application_submitted ??
      orig.application_submitted ??
      orig.submitted ??
      orig.is_submitted;
    out.app_submitted_date_time =
      out.app_submitted_date_time ??
      orig.app_submitted_date_time ??
      orig.submitted_at ??
      orig.submittedAt;
    out.application_admin_approval =
      out.application_admin_approval ??
      orig.application_admin_approval ??
      orig.applicationAdminApproval;
    out.approved_at = out.approved_at ?? orig.approved_at ?? orig.approvedAt;
    out.approved_by = out.approved_by ?? orig.approved_by ?? orig.approvedBy;
    return;
  }
  out.application_submitted =
    out.application_submitted ??
    app.application_submitted ??
    app.submitted ??
    app.is_submitted;
  out.app_submitted_date_time =
    out.app_submitted_date_time ??
    app.app_submitted_date_time ??
    app.submitted_at ??
    app.submittedAt;
  out.application_admin_approval =
    out.application_admin_approval ??
    app.application_admin_approval ??
    app.applicationAdminApproval;
  out.approved_at = out.approved_at ?? app.approved_at ?? app.approvedAt;
  out.approved_by = out.approved_by ?? app.approved_by ?? app.approvedBy;
}

// Normalize providers data
export function normalizeProviders(out: any) {
  const p = out.providers;
  if (p === undefined || p === null) return;
  if (Array.isArray(p)) return;
  if (typeof p === "string") {
    const parsed = parseMaybeJson(p);
    if (parsed !== undefined) {
      out.providers = Array.isArray(parsed) ? parsed : parsed;
    } else if (process.env.NODE_ENV === "development") {
      console.warn("Providers string failed to parse as JSON", {
        providers: p,
      });
    }
  }
}

// Sanitize edited fields for saving (only allow editable fields)
export const EDITABLE_FIELDS = [
  "student_name",
  "father_name",
  "gender",
  "phone",
  "email",
  "city",
  "state",
] as const;

export function sanitizeEditedFields(
  data: Record<string, any>
): Record<string, any> {
  const sanitized: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (!EDITABLE_FIELDS.includes(key as any)) return;
    if (typeof value === "string") {
      sanitized[key] = value.trim();
    } else if (value === undefined || value === null) {
      sanitized[key] = "";
    } else {
      sanitized[key] = String(value);
    }
  });
  return sanitized;
}
