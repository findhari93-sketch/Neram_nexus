"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ExamCenter, ExamCenterInput } from "@/data/types";
import {
  INDIAN_STATES,
  CITIES_BY_STATE,
  EXAM_TYPES,
  CENTER_STATUS,
  type IndianState,
} from "@/data/indian-states-cities";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CircularProgress from "@mui/material/CircularProgress";
import BuildingIcon from "@mui/icons-material/Domain";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LanguageIcon from "@mui/icons-material/Language";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface ExamCenterFormProps {
  centerId?: string; // If provided, we're editing
}

export default function ExamCenterForm({ centerId }: ExamCenterFormProps) {
  const router = useRouter();
  const isEditing = !!centerId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ExamCenterInput>({
    exam_type: "NATA",
    state: "",
    city: "",
    center_name: "",
    center_code: "",
    description: "",
    address: "",
    pincode: "",
    phone_number: "",
    alternate_phone: "",
    email: "",
    contact_person: "",
    contact_designation: "",
    google_maps_link: "",
    latitude: undefined,
    longitude: undefined,
    active_years: [],
    is_confirmed_current_year: false,
    status: "active",
    facilities: "",
    instructions: "",
    nearest_railway: "",
    nearest_bus_stand: "",
    landmarks: "",
    capacity: undefined,
  });

  // Year input for adding
  const [yearInput, setYearInput] = useState<string>("");

  // Available cities based on selected state
  const availableCities = useMemo(() => {
    if (!formData.state) return [];
    return CITIES_BY_STATE[formData.state as IndianState] || [];
  }, [formData.state]);

  // Current year
  const currentYear = new Date().getFullYear();

  // Load existing center data if editing
  useEffect(() => {
    if (centerId) {
      loadCenter();
    }
  }, [centerId]);

  const loadCenter = async () => {
    try {
      const { data, error } = await supabase
        .from("exam_centers")
        .select("*")
        .eq("id", centerId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          exam_type: data.exam_type,
          state: data.state,
          city: data.city,
          center_name: data.center_name,
          center_code: data.center_code || "",
          description: data.description || "",
          address: data.address,
          pincode: data.pincode || "",
          phone_number: data.phone_number || "",
          alternate_phone: data.alternate_phone || "",
          email: data.email || "",
          contact_person: data.contact_person || "",
          contact_designation: data.contact_designation || "",
          google_maps_link: data.google_maps_link || "",
          latitude: data.latitude || undefined,
          longitude: data.longitude || undefined,
          active_years: data.active_years || [],
          is_confirmed_current_year: data.is_confirmed_current_year,
          status: data.status,
          facilities: data.facilities || "",
          instructions: data.instructions || "",
          nearest_railway: data.nearest_railway || "",
          nearest_bus_stand: data.nearest_bus_stand || "",
          landmarks: data.landmarks || "",
          capacity: data.capacity || undefined,
        });
      }
    } catch (err) {
      console.error("Error loading center:", err);
      setError("Failed to load exam center");
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (field: keyof ExamCenterInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset city when state changes
    if (field === "state") {
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  };

  // Add year to active_years
  const handleAddYear = () => {
    const year = parseInt(yearInput);
    if (!isNaN(year) && year >= 2000 && year <= 2100) {
      if (!formData.active_years.includes(year)) {
        setFormData((prev) => ({
          ...prev,
          active_years: [...prev.active_years, year].sort((a, b) => b - a),
        }));
      }
      setYearInput("");
    }
  };

  // Remove year from active_years
  const handleRemoveYear = (year: number) => {
    setFormData((prev) => ({
      ...prev,
      active_years: prev.active_years.filter((y) => y !== year),
    }));
  };

  // Quick add common years
  const quickAddYears = () => {
    const years = [currentYear, currentYear - 1, currentYear - 2];
    setFormData((prev) => ({
      ...prev,
      active_years: [...new Set([...prev.active_years, ...years])].sort(
        (a, b) => b - a
      ),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    // Validation
    if (
      !formData.exam_type ||
      !formData.state ||
      !formData.city ||
      !formData.center_name ||
      !formData.address
    ) {
      setError("Please fill in all required fields");
      setSaving(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        center_code: formData.center_code || null,
        description: formData.description || null,
        pincode: formData.pincode || null,
        phone_number: formData.phone_number || null,
        alternate_phone: formData.alternate_phone || null,
        email: formData.email || null,
        contact_person: formData.contact_person || null,
        contact_designation: formData.contact_designation || null,
        google_maps_link: formData.google_maps_link || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        facilities: formData.facilities || null,
        instructions: formData.instructions || null,
        nearest_railway: formData.nearest_railway || null,
        nearest_bus_stand: formData.nearest_bus_stand || null,
        landmarks: formData.landmarks || null,
        capacity: formData.capacity || null,
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("exam_centers")
          .update(submitData)
          .eq("id", centerId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("exam_centers")
          .insert(submitData);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/exam-centers");
      }, 1500);
    } catch (err: any) {
      console.error("Error saving center:", err);
      setError(err.message || "Failed to save exam center");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CircularProgress sx={{ marginBottom: 1.5 }} />
          <p className="text-gray-600">Loading exam center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/exam-centers"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Exam Center" : "Add Exam Center"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isEditing
                  ? "Update exam center information"
                  : "Add a new NATA or JEE exam center"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />
            <p className="text-green-800">
              Exam center {isEditing ? "updated" : "created"} successfully!
              Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <ErrorIcon sx={{ color: "error.main", fontSize: 20 }} />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <BuildingIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <h2 className="font-semibold text-gray-900">
                  Basic Information
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.exam_type}
                    onChange={(e) => handleChange("exam_type", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {EXAM_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Center Code
                  </label>
                  <input
                    type="text"
                    value={formData.center_code}
                    onChange={(e) =>
                      handleChange("center_code", e.target.value)
                    }
                    placeholder="e.g., TN001"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Center Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.center_name}
                  onChange={(e) => handleChange("center_name", e.target.value)}
                  placeholder="e.g., Anna University - CEG Campus"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief description about the exam center..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CENTER_STATUS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity || ""}
                    onChange={(e) =>
                      handleChange(
                        "capacity",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="e.g., 200"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <LocationOnIcon
                  sx={{ fontSize: 20, color: "text.secondary" }}
                />
                <h2 className="font-semibold text-gray-900">Location</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    disabled={!formData.state}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select City</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {formData.state && availableCities.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No predefined cities. You can type a custom city name.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Full address of the exam center..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    placeholder="e.g., 600025"
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ""}
                    onChange={(e) =>
                      handleChange(
                        "latitude",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="e.g., 13.0827"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ""}
                    onChange={(e) =>
                      handleChange(
                        "longitude",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="e.g., 80.2707"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Maps Link
                </label>
                <div className="relative">
                  <LanguageIcon
                    sx={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 18,
                      color: "action.disabled",
                    }}
                  />
                  <input
                    type="url"
                    value={formData.google_maps_link}
                    onChange={(e) =>
                      handleChange("google_maps_link", e.target.value)
                    }
                    placeholder="https://maps.google.com/..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmarks
                </label>
                <input
                  type="text"
                  value={formData.landmarks}
                  onChange={(e) => handleChange("landmarks", e.target.value)}
                  placeholder="Notable landmarks near the center..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nearest Railway Station
                  </label>
                  <div className="relative">
                    <TrainIcon
                      sx={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 18,
                        color: "action.disabled",
                      }}
                    />
                    <input
                      type="text"
                      value={formData.nearest_railway}
                      onChange={(e) =>
                        handleChange("nearest_railway", e.target.value)
                      }
                      placeholder="e.g., Guindy Railway Station"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nearest Bus Stand
                  </label>
                  <div className="relative">
                    <DirectionsBusIcon
                      sx={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 18,
                        color: "action.disabled",
                      }}
                    />
                    <input
                      type="text"
                      value={formData.nearest_bus_stand}
                      onChange={(e) =>
                        handleChange("nearest_bus_stand", e.target.value)
                      }
                      placeholder="e.g., Guindy Bus Terminus"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <PersonIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <h2 className="font-semibold text-gray-900">
                  Contact Information
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) =>
                      handleChange("contact_person", e.target.value)
                    }
                    placeholder="e.g., Prof. Kumar"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.contact_designation}
                    onChange={(e) =>
                      handleChange("contact_designation", e.target.value)
                    }
                    placeholder="e.g., Exam Coordinator"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon
                      sx={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 18,
                        color: "action.disabled",
                      }}
                    />
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) =>
                        handleChange("phone_number", e.target.value)
                      }
                      placeholder="e.g., 044-22357890"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Phone
                  </label>
                  <div className="relative">
                    <PhoneIcon
                      sx={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 18,
                        color: "action.disabled",
                      }}
                    />
                    <input
                      type="tel"
                      value={formData.alternate_phone}
                      onChange={(e) =>
                        handleChange("alternate_phone", e.target.value)
                      }
                      placeholder="Secondary contact number"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <EmailIcon
                    sx={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 18,
                      color: "action.disabled",
                    }}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="exam@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Year Tracking */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <CalendarTodayIcon
                  sx={{ fontSize: 20, color: "text.secondary" }}
                />
                <h2 className="font-semibold text-gray-900">Year Tracking</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years this center was used
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.active_years.length === 0 ? (
                    <p className="text-sm text-gray-400">No years added yet</p>
                  ) : (
                    formData.active_years.map((year) => (
                      <span
                        key={year}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                          year === currentYear
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        {year}
                        <button
                          type="button"
                          onClick={() => handleRemoveYear(year)}
                          className="p-0.5 hover:bg-gray-200 rounded-full"
                        >
                          <CloseIcon sx={{ fontSize: 12 }} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    placeholder="Enter year"
                    min="2000"
                    max="2100"
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddYear())
                    }
                  />
                  <button
                    type="button"
                    onClick={handleAddYear}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <AddIcon sx={{ fontSize: 18 }} />
                  </button>
                  <button
                    type="button"
                    onClick={quickAddYears}
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Add {currentYear}, {currentYear - 1}, {currentYear - 2}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <input
                  type="checkbox"
                  id="confirmed"
                  checked={formData.is_confirmed_current_year}
                  onChange={(e) =>
                    handleChange("is_confirmed_current_year", e.target.checked)
                  }
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label
                  htmlFor="confirmed"
                  className="text-sm font-medium text-green-800"
                >
                  Confirmed as exam center for {currentYear}
                </label>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <InfoIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <h2 className="font-semibold text-gray-900">
                  Additional Information
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facilities
                </label>
                <textarea
                  value={formData.facilities}
                  onChange={(e) => handleChange("facilities", e.target.value)}
                  placeholder="e.g., Parking available, AC halls, Wheelchair accessible..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions for Students
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => handleChange("instructions", e.target.value)}
                  placeholder="Special instructions for students appearing at this center..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/exam-centers"
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || success}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <CircularProgress size={16} color="inherit" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon sx={{ fontSize: 18 }} />
                  {isEditing ? "Update Center" : "Create Center"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
