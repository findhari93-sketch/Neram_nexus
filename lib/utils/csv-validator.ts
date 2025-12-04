/**
 * CSV Validator utility for exam centers
 * Validates parsed CSV data against business rules
 */

import {
  INDIAN_STATES,
  CITIES_BY_STATE,
  EXAM_TYPES,
  CENTER_STATUS,
} from "@/data/indian-states-cities";

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  processedCount: number;
}

/**
 * Validate a single exam center record
 */
export function validateExamCenter(
  row: Record<string, any>,
  rowNumber: number
): { valid: boolean; errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Extract enum values from EXAM_TYPES and CENTER_STATUS
  const validExamTypes = EXAM_TYPES.map((e) => e.value);
  const validStatuses = CENTER_STATUS.map((s) => s.value);

  // Check required fields
  const requiredFields = [
    "exam_type",
    "state",
    "city",
    "center_name",
    "address",
  ];
  for (const field of requiredFields) {
    if (!row[field]) {
      errors.push({
        row: rowNumber,
        field,
        value: row[field],
        error: `${field} is required`,
      });
    }
  }

  // Validate exam type
  if (row.exam_type && !validExamTypes.includes(row.exam_type)) {
    errors.push({
      row: rowNumber,
      field: "exam_type",
      value: row.exam_type,
      error: `Invalid exam type. Must be one of: ${validExamTypes.join(", ")}`,
    });
  }

  // Validate state
  if (row.state && !INDIAN_STATES.includes(row.state)) {
    errors.push({
      row: rowNumber,
      field: "state",
      value: row.state,
      error: `Invalid state: ${row.state}`,
    });
  }

  // Validate city against state
  if (row.state && row.city) {
    const validCities =
      CITIES_BY_STATE[row.state as keyof typeof CITIES_BY_STATE] || [];
    if (validCities.length > 0 && !validCities.includes(row.city)) {
      warnings.push({
        row: rowNumber,
        field: "city",
        value: row.city,
        error: `City "${row.city}" may not be valid for state "${row.state}"`,
      });
    }
  }

  // Validate center name length
  if (row.center_name && row.center_name.length < 3) {
    errors.push({
      row: rowNumber,
      field: "center_name",
      value: row.center_name,
      error: "Center name must be at least 3 characters",
    });
  }

  // Validate address length
  if (row.address && row.address.length < 5) {
    errors.push({
      row: rowNumber,
      field: "address",
      value: row.address,
      error: "Address must be at least 5 characters",
    });
  }

  // Validate pincode
  if (row.pincode && !/^\d{6}$/.test(row.pincode)) {
    errors.push({
      row: rowNumber,
      field: "pincode",
      value: row.pincode,
      error: "Pincode must be exactly 6 digits",
    });
  }

  // Validate latitude
  if (row.latitude) {
    const lat =
      typeof row.latitude === "number"
        ? row.latitude
        : parseFloat(row.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push({
        row: rowNumber,
        field: "latitude",
        value: row.latitude,
        error: "Latitude must be a number between -90 and 90",
      });
    }
  }

  // Validate longitude
  if (row.longitude) {
    const lng =
      typeof row.longitude === "number"
        ? row.longitude
        : parseFloat(row.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push({
        row: rowNumber,
        field: "longitude",
        value: row.longitude,
        error: "Longitude must be a number between -180 and 180",
      });
    }
  }

  // Validate phone number
  if (row.phone_number && !/^[0-9+\-\s()]{10,}$/.test(row.phone_number)) {
    errors.push({
      row: rowNumber,
      field: "phone_number",
      value: row.phone_number,
      error: "Phone number must be at least 10 digits",
    });
  }

  // Validate email
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push({
      row: rowNumber,
      field: "email",
      value: row.email,
      error: "Email format is invalid",
    });
  }

  // Validate status
  if (row.status && !validStatuses.includes(row.status)) {
    errors.push({
      row: rowNumber,
      field: "status",
      value: row.status,
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  // Validate active years
  if (row.active_years && Array.isArray(row.active_years)) {
    const invalidYears = row.active_years.filter(
      (y: any) => isNaN(y) || y < 2000 || y > 2100
    );
    if (invalidYears.length > 0) {
      errors.push({
        row: rowNumber,
        field: "active_years",
        value: row.active_years,
        error: "Years must be valid numbers between 2000 and 2100",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate multiple exam center records (CSV rows)
 */
export function validateExamCenters(
  rows: Record<string, any>[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let processedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2; // +2 because row 1 is header, and 0-indexed
    const row = rows[i];

    const validation = validateExamCenter(row, rowNumber);
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);

    if (validation.valid) {
      processedCount++;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    processedCount,
  };
}

/**
 * Get validation summary for display
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.errors.length === 0) {
    return `All ${result.processedCount} records are valid and ready to import.`;
  }

  const errorCount = result.errors.length;
  return `${errorCount} error(s) found. ${result.processedCount} valid record(s) can be imported.`;
}
