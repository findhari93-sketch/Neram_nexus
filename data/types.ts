// Exam Center types
export type ExamType = "NATA" | "JEE Paper 2";

export type CenterStatus = "active" | "inactive" | "discontinued";

export interface ExamCenter {
  id: string;
  exam_type: ExamType;
  state: string;
  city: string;
  center_name: string;
  center_code?: string;
  description?: string;
  address: string;
  pincode?: string;
  phone_number?: string;
  alternate_phone?: string;
  email?: string;
  contact_person?: string;
  contact_designation?: string;
  google_maps_link?: string;
  latitude?: number;
  longitude?: number;
  active_years: number[];
  is_confirmed_current_year: boolean;
  status: CenterStatus;
  facilities?: string;
  instructions?: string;
  nearest_railway?: string;
  nearest_bus_stand?: string;
  landmarks?: string;
  capacity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExamCenterInput
  extends Omit<ExamCenter, "id" | "created_at" | "updated_at"> {}
