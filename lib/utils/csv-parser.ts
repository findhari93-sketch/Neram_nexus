/**
 * CSV Parser utility for exam centers
 * Handles parsing CSV content and converting to exam center objects
 */

import { z } from "zod";

export interface CSVRow {
  [key: string]: string;
}

export interface ParseCSVResult {
  success: boolean;
  rows: CSVRow[];
  error?: string;
  errorLine?: number;
}

/**
 * Parse CSV content string into rows
 * Handles quoted fields and line breaks within quoted fields
 */
export function parseCSV(content: string): ParseCSVResult {
  try {
    const lines = content.split("\n");
    if (lines.length < 2) {
      return {
        success: false,
        rows: [],
        error: "CSV file must contain header and at least one data row",
      };
    }

    // Parse header
    const headerLine = lines[0].trim();
    if (!headerLine) {
      return {
        success: false,
        rows: [],
        error: "CSV header is empty",
      };
    }

    const headers = parseCSVLine(headerLine);
    if (headers.length === 0) {
      return {
        success: false,
        rows: [],
        error: "CSV header is empty",
      };
    }

    // Parse data rows
    const rows: CSVRow[] = [];
    let currentLine = "";
    let inQuotes = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Handle quoted fields that may span multiple lines
      currentLine += (currentLine ? "\n" : "") + line;

      // Count quotes to check if we're inside a quoted field
      const quoteCount = (currentLine.match(/"/g) || []).length;
      inQuotes = quoteCount % 2 === 1;

      // If we have a complete line (even number of quotes or no quotes)
      if (!inQuotes) {
        const values = parseCSVLine(currentLine);

        // Only process if we have the right number of columns
        if (values.length === headers.length) {
          const row: CSVRow = {};
          headers.forEach((header, index) => {
            row[header.toLowerCase().trim()] = values[index];
          });
          rows.push(row);
          currentLine = "";
        } else if (values.length > 0 && currentLine.trim()) {
          // Non-empty line with wrong number of columns
          return {
            success: false,
            rows,
            error: `Row ${rows.length + 2}: Expected ${
              headers.length
            } columns, got ${values.length}`,
            errorLine: rows.length + 2,
          };
        }
      }
    }

    if (inQuotes) {
      return {
        success: false,
        rows,
        error: "Unclosed quoted field at end of file",
      };
    }

    if (currentLine.trim()) {
      return {
        success: false,
        rows,
        error: `Last row has incorrect format`,
      };
    }

    return { success: true, rows };
  } catch (error) {
    return {
      success: false,
      rows: [],
      error: `Failed to parse CSV: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = "";
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Convert CSV row to exam center object
 * Maps CSV column names to database field names
 */
export function csvRowToExamCenter(row: CSVRow): Record<string, any> {
  const columnMap: Record<string, string> = {
    exam_type: "exam_type",
    state: "state",
    city: "city",
    center_name: "center_name",
    "center name": "center_name",
    center_code: "center_code",
    "center code": "center_code",
    code: "center_code",
    address: "address",
    pincode: "pincode",
    "pin code": "pincode",
    latitude: "latitude",
    lat: "latitude",
    longitude: "longitude",
    lng: "longitude",
    lon: "longitude",
    contact_person_name: "contact_person_name",
    "contact person": "contact_person_name",
    "contact person name": "contact_person_name",
    contact_person_designation: "contact_person_designation",
    "contact person designation": "contact_person_designation",
    designation: "contact_person_designation",
    phone_number: "phone_number",
    phone: "phone_number",
    "phone number": "phone_number",
    email: "email",
    active_years: "active_years",
    "active years": "active_years",
    years: "active_years",
    is_confirmed_current_year: "is_confirmed_current_year",
    "confirmed current year": "is_confirmed_current_year",
    confirmed: "is_confirmed_current_year",
    status: "status",
    facilities: "facilities",
    special_instructions: "special_instructions",
    instructions: "special_instructions",
    nearby_landmarks: "nearby_landmarks",
    landmarks: "nearby_landmarks",
    public_transport_details: "public_transport_details",
    transport: "public_transport_details",
    description: "description",
  };

  const result: Record<string, any> = {};

  for (const [csvKey, value] of Object.entries(row)) {
    const dbKey = columnMap[csvKey.toLowerCase()];
    if (dbKey && value) {
      // Handle special field conversions
      if (dbKey === "latitude" || dbKey === "longitude") {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          result[dbKey] = num;
        }
      } else if (dbKey === "is_confirmed_current_year") {
        result[dbKey] =
          value.toLowerCase() === "true" ||
          value.toLowerCase() === "yes" ||
          value === "1";
      } else if (dbKey === "active_years") {
        try {
          const years = value
            .split(/[,;]/)
            .map((y) => parseInt(y.trim()))
            .filter((y) => !isNaN(y));
          if (years.length > 0) {
            result[dbKey] = years;
          }
        } catch {
          // Keep as is
        }
      } else if (dbKey === "facilities") {
        result[dbKey] = value
          .split(/[,;]/)
          .map((f) => f.trim())
          .filter((f) => f);
      } else {
        result[dbKey] = value;
      }
    }
  }

  return result;
}
