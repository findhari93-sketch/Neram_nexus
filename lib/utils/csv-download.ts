/**
 * CSV Download utility for exam centers
 * Handles exporting exam center data to CSV format
 */

import type { ExamCenter } from "@/data/types";

/**
 * Escape CSV field value
 * If field contains comma, quotes, or newline, wrap in quotes and escape inner quotes
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Check if field needs quoting
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    // Escape quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert exam centers to CSV format
 */
export function examCentersToCSV(centers: ExamCenter[]): string {
  // CSV headers
  const headers = [
    "exam_type",
    "state",
    "city",
    "center_name",
    "center_code",
    "address",
    "pincode",
    "latitude",
    "longitude",
    "contact_person",
    "contact_designation",
    "phone_number",
    "email",
    "is_confirmed_current_year",
    "status",
    "active_years",
    "facilities",
    "instructions",
    "landmarks",
    "nearest_railway",
    "nearest_bus_stand",
    "description",
  ];

  // Build CSV lines
  const lines: string[] = [];

  // Add header row
  lines.push(headers.map(escapeCSVField).join(","));

  // Add data rows
  for (const center of centers) {
    const row = [
      center.exam_type,
      center.state,
      center.city,
      center.center_name,
      center.center_code || "",
      center.address,
      center.pincode || "",
      center.latitude || "",
      center.longitude || "",
      center.contact_person || "",
      center.contact_designation || "",
      center.phone_number || "",
      center.email || "",
      center.is_confirmed_current_year ? "true" : "false",
      center.status,
      (center.active_years || []).join(";"),
      center.facilities || "",
      center.instructions || "",
      center.landmarks || "",
      center.nearest_railway || "",
      center.nearest_bus_stand || "",
      center.description || "",
    ];

    lines.push(row.map(escapeCSVField).join(","));
  }

  return lines.join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(
  csvContent: string,
  filename: string = "exam-centers.csv"
): void {
  // Create blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create URL
  const url = URL.createObjectURL(blob);

  // Create link and trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);
}

/**
 * Generate CSV template for import
 */
export function generateCSVTemplate(): string {
  const templateData = [
    {
      exam_type: "NATA",
      state: "Maharashtra",
      city: "Mumbai",
      center_name: "Mumbai Center 1",
      center_code: "MUM001",
      address: "123 Main Street, Building A",
      pincode: "400001",
      latitude: 19.076,
      longitude: 72.8777,
      contact_person: "John Doe",
      contact_designation: "Center Manager",
      phone_number: "+91-22-12345678",
      email: "contact@mumbaicentre.com",
      is_confirmed_current_year: "true",
      status: "active",
      active_years: "2023;2024;2025",
      facilities: "Parking; WiFi; Rest Room",
      instructions: "Arrive 15 minutes early",
      landmarks: "Near Railway Station",
      nearest_railway: "Railway Station",
      nearest_bus_stand: "Bus Stand",
      description: "Main exam center for Mumbai region",
    },
    {
      exam_type: "JEE Paper 2",
      state: "Delhi",
      city: "New Delhi",
      center_name: "Delhi Center 1",
      center_code: "DEL001",
      address: "456 Park Avenue, Suite B",
      pincode: "110001",
      latitude: 28.6139,
      longitude: 77.209,
      contact_person: "Jane Smith",
      contact_designation: "Coordinator",
      phone_number: "+91-11-87654321",
      email: "contact@delhicentre.com",
      is_confirmed_current_year: "false",
      status: "active",
      active_years: "2024;2025",
      facilities: "Accessible; WiFi; Cafeteria",
      instructions: "Check ID at entrance",
      landmarks: "Near Metro Station",
      nearest_railway: "Metro Station",
      nearest_bus_stand: "Bus Stand",
      description: "Secondary center for Delhi region",
    },
  ];

  return examCentersToCSV(templateData as unknown as ExamCenter[]);
}

/**
 * Get current date formatted for filename
 */
export function getDateForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
