/**
 * Column definitions for UserTable
 * Extracted from WebUsersGrid to improve maintainability
 */

import React from "react";
import type { MRT_ColumnDef } from "material-react-table";
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import type { NormalizedUser } from "@/hooks/useUserData";
import {
  AvatarWithFallback,
  ProvidersCell,
  ContactFieldCell,
  DateCell,
  BoolCell,
  AdminApprovalCell,
  EditableCell,
} from "./CellComponents";
import { resolvePhotoFromRow } from "@/lib/utils/photoResolver";
import { mrtTableProps } from "../../(protected)/mrtTheme";

// Constants
const DEFAULT_AVATAR_SIZE = 24;

// Default filter props
const defaultFilterProps = ({
  column,
}: {
  column: {
    getFilterValue: () => unknown;
    setFilterValue: (val: unknown) => void;
  };
}) => {
  const base = (mrtTableProps?.muiFilterTextFieldProps ?? {}) as Record<
    string,
    unknown
  >;

  return {
    ...base,
    placeholder: "",
    InputProps: {
      ...((base.InputProps ?? {}) as Record<string, unknown>),
      endAdornment: column.getFilterValue() ? (
        <InputAdornment position="end">
          <IconButton
            size="small"
            onClick={() => column.setFilterValue(undefined)}
            aria-label="Clear filter"
          >
            ×
          </IconButton>
        </InputAdornment>
      ) : undefined,
    },
  };
};

/**
 * Action handlers interface
 */
export interface ColumnActionHandlers {
  handleOpen: (user: NormalizedUser) => void;
  handleEdit: (user: NormalizedUser) => void;
  handleDelete: (user: NormalizedUser) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleFieldChange: (field: keyof NormalizedUser, value: unknown) => void;
  openAvatar?: (user: NormalizedUser, name?: string) => void;
}

/**
 * State interface for columns
 */
export interface ColumnState {
  editingRowId: string | number | null;
  editedData: Partial<NormalizedUser>;
  canEdit: boolean;
  isSaving: boolean;
}

/**
 * Create column definitions with action handlers
 */
export function createColumns(
  handlers: ColumnActionHandlers,
  state: ColumnState
): MRT_ColumnDef<NormalizedUser>[] {
  const { editingRowId, editedData, canEdit, isSaving } = state;
  const {
    handleOpen,
    handleEdit,
    handleDelete,
    handleSave,
    handleCancel,
    handleFieldChange,
    openAvatar,
  } = handlers;

  return [
    // Actions column
    {
      id: "actions",
      header: "",
      muiTableHeadCellProps: { sx: { width: 72, textAlign: "center" } },
      columns: [
        {
          accessorKey: "actions",
          header: "",
          size: 110,
          enableColumnActions: false,
          muiTableHeadCellProps: {
            sx: {
              "& .mrt-column-drag-button, & .mrt-column-actions-button, & .mrt-resize-handle":
                {
                  display: "none !important",
                },
              textAlign: "center",
            },
          },
          enableSorting: false,
          enableColumnFilter: false,
          Cell: ({ row }) => {
            const orig = row.original;
            const isEditing = editingRowId === orig.id;
            const isSavingRow = isSaving && editingRowId === orig.id;

            if (isEditing) {
              return (
                <Box
                  sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
                >
                  <Tooltip title="Save changes" arrow>
                    <IconButton
                      size="small"
                      onClick={handleSave}
                      disabled={isSavingRow}
                      aria-label="Save changes"
                      sx={{
                        padding: "4px",
                        color: "success.main",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      {isSavingRow ? (
                        <CircularProgress size={16} />
                      ) : (
                        <CheckIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel" arrow>
                    <IconButton
                      size="small"
                      onClick={handleCancel}
                      disabled={isSavingRow}
                      aria-label="Cancel edit"
                      sx={{
                        padding: "4px",
                        color: "error.main",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            }

            return (
              <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                <Tooltip title="Open details" arrow>
                  <IconButton
                    className="mrt-action-btns"
                    size="small"
                    aria-label="Open user details"
                    onClick={() => handleOpen(orig)}
                    sx={{
                      padding: "4px",
                      color: "primary.main",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {canEdit && (
                  <>
                    <Tooltip title="Edit user" arrow>
                      <IconButton
                        className="mrt-action-btns"
                        size="small"
                        aria-label="Edit user"
                        onClick={() => handleEdit(orig)}
                        sx={{
                          padding: "4px",
                          color: "secondary.main",
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete user" arrow>
                      <IconButton
                        className="mrt-action-btns"
                        size="small"
                        aria-label="Delete user"
                        onClick={() => handleDelete(orig)}
                        sx={{
                          padding: "4px",
                          color: "error.main",
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            );
          },
        },
      ],
    },
    // Basic Info
    {
      header: "Basic",
      muiTableHeadCellProps: { sx: { textAlign: "left" } },
      columns: [
        {
          accessorKey: "student_name",
          header: "Student Name",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => {
            const orig = row.original;
            const isEditing = editingRowId === orig.id;
            const name =
              orig.student_name ??
              orig.display_name ??
              orig.name ??
              `User #${orig.id ?? "Unknown"}`;

            const photoUrl = resolvePhotoFromRow(
              orig as Record<string, unknown>
            );

            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AvatarWithFallback
                  src={photoUrl}
                  name={name}
                  onClick={
                    openAvatar ? () => openAvatar(orig, name) : undefined
                  }
                  size={DEFAULT_AVATAR_SIZE}
                />
                <EditableCell
                  value={isEditing ? editedData.student_name : name}
                  isEditing={isEditing}
                  onChange={(val) => handleFieldChange("student_name", val)}
                  field="student_name"
                  placeholder="Student name"
                />
              </Box>
            );
          },
        },
        {
          accessorKey: "father_name",
          header: "Father Name",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => {
            const orig = row.original;
            const isEditing = editingRowId === orig.id;
            return (
              <EditableCell
                value={isEditing ? editedData.father_name : orig.father_name}
                isEditing={isEditing}
                onChange={(val) => handleFieldChange("father_name", val)}
                field="father_name"
                placeholder="Father name"
              />
            );
          },
        },
        {
          accessorKey: "gender",
          header: "Gender",
          size: 150,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => {
            const orig = row.original;
            const isEditing = editingRowId === orig.id;
            return (
              <EditableCell
                value={isEditing ? editedData.gender : orig.gender}
                isEditing={isEditing}
                onChange={(val) => handleFieldChange("gender", val)}
                field="gender"
                placeholder="Gender"
              />
            );
          },
        },
      ],
    },
    // Contact Details
    {
      header: "Contact Details",
      muiTableHeadCellProps: { sx: { textAlign: "left" } },
      columns: [
        {
          accessorKey: "phone",
          header: "Phone 1",
          size: 150,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => {
            const orig = row.original;
            const isEditing = editingRowId === orig.id;
            const phone = orig.phone || "";
            return (
              <EditableCell
                value={isEditing ? editedData.phone : phone}
                isEditing={isEditing}
                onChange={(val) => handleFieldChange("phone", val)}
                field="phone"
                placeholder="Phone"
              />
            );
          },
        },
        {
          accessorKey: "email",
          header: "Email",
          size: 240,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => {
            const orig = row.original;
            const isEditing = editingRowId === orig.id;
            const email = orig.email || "";
            return (
              <EditableCell
                value={isEditing ? editedData.email : email}
                isEditing={isEditing}
                onChange={(val) => handleFieldChange("email", val)}
                field="email"
                placeholder="Email"
              />
            );
          },
        },
        {
          accessorKey: "city",
          header: "City",
          size: 140,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => {
            const orig = row.original;
            const isEditing = editingRowId === orig.id;
            const city = orig.city || "";
            return (
              <EditableCell
                value={isEditing ? editedData.city : city}
                isEditing={isEditing}
                onChange={(val) => handleFieldChange("city", val)}
                field="city"
                placeholder="City"
              />
            );
          },
        },
        {
          accessorKey: "state",
          header: "State",
          size: 160,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => {
            const orig = row.original;
            const isEditing = editingRowId === orig.id;
            const state = orig.state || "";
            return (
              <EditableCell
                value={isEditing ? editedData.state : state}
                isEditing={isEditing}
                onChange={(val) => handleFieldChange("state", val)}
                field="state"
                placeholder="State"
              />
            );
          },
        },
        {
          accessorKey: "country",
          header: "Country",
          size: 160,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => (
            <ContactFieldCell original={row.original} field="country" />
          ),
        },
        {
          accessorKey: "zip_code",
          header: "Zip Code",
          size: 150,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => (
            <ContactFieldCell original={row.original} field="zip_code" />
          ),
        },
      ],
    },
    // Account Details
    {
      header: "Account Details",
      muiTableHeadCellProps: { sx: { textAlign: "left" } },
      columns: [
        {
          accessorKey: "account_type",
          header: "Account Type",
          size: 150,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "providers",
          header: "Providers",
          size: 180,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => <ProvidersCell original={row.original} />,
        },
        {
          accessorKey: "firebase_uid",
          header: "Firebase UID",
          size: 240,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "phone_auth_used",
          header: "Phone Auth",
          size: 170,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => (
            <BoolCell value={row.original.phone_auth_used} label="Phone Auth" />
          ),
        },
        {
          accessorKey: "created_at",
          header: "Created At",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => <DateCell value={row.original.created_at} />,
        },
        {
          accessorKey: "last_sign_in",
          header: "Last Sign In",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => <DateCell value={row.original.last_sign_in} />,
        },
      ],
    },
    // Application Details
    {
      header: "Application Details",
      muiTableHeadCellProps: { sx: { textAlign: "left" } },
      columns: [
        {
          accessorKey: "application_submitted",
          header: "App Submitted",
          size: 190,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => (
            <BoolCell
              value={row.original.application_submitted}
              label="Application Submitted"
            />
          ),
        },
        {
          accessorKey: "app_submitted_date_time",
          header: "App Submitted at",
          size: 220,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "application_admin_approval",
          header: "Admin Approval",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
          Cell: ({ row }) => <AdminApprovalCell original={row.original} />,
        },
        {
          accessorKey: "approved_at",
          header: "Approved At",
          size: 180,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "approved_by",
          header: "Approved By",
          size: 180,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "email_status",
          header: "Email Status",
          size: 180,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "email_sent_at",
          header: "Email Sent At",
          size: 180,
          muiFilterTextFieldProps: defaultFilterProps,
        },
      ],
    },
    // Admin Filled
    {
      header: "Admin Filled",
      muiTableHeadCellProps: { sx: { textAlign: "left" } },
      columns: [
        {
          accessorKey: "final_course_Name",
          header: "Final Course Name",
          size: 220,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "course_duration",
          header: "Course Duration",
          size: 220,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "payment_options",
          header: "Payment Options",
          size: 220,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "total_course_fees",
          header: "Total Course Fees",
          size: 220,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "first_installment_amount",
          header: "Installment 1",
          size: 190,
          muiFilterTextFieldProps: defaultFilterProps,
          muiTableBodyCellProps: {
            sx: {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          },
        },
        {
          accessorKey: "second_installment_amount",
          header: "Installment 2",
          size: 190,
          muiFilterTextFieldProps: defaultFilterProps,
          muiTableBodyCellProps: {
            sx: {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          },
        },
        {
          accessorKey: "second_installment_date",
          header: "Installment 2 Date",
          size: 220,
          muiFilterTextFieldProps: defaultFilterProps,
          muiTableBodyCellProps: {
            sx: {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          },
        },
        {
          accessorKey: "final_fee_payment_amount",
          header: "Fee Final Amt",
          size: 180,
          muiFilterTextFieldProps: defaultFilterProps,
          muiTableBodyCellProps: {
            sx: {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          },
        },
        {
          accessorKey: "remaining_fees",
          header: "Remaining Fees",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "discount",
          header: "Discount",
          size: 160,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "will_study_next_year",
          header: "Will Study NY",
          size: 190,
          muiFilterTextFieldProps: defaultFilterProps,
          muiTableBodyCellProps: {
            sx: {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          },
        },
        {
          accessorKey: "nata_attempt_year",
          header: "NATA Attempt Year",
          size: 220,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "offer_before_date",
          header: "Offer Before",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "admin_comment",
          header: "Admin Comment",
          size: 260,
          muiFilterTextFieldProps: defaultFilterProps,
        },
      ],
    },
    // Final Fee Payment Details
    {
      header: "Final Fee Payment Details",
      muiTableHeadCellProps: { sx: { textAlign: "left" } },
      columns: [
        {
          accessorKey: "payment_status",
          header: "Payment Status",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "payment_method",
          header: "Payment Method",
          size: 220,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "payment_at",
          header: "Payment At",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "payment_id",
          header: "Payment ID",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "order_id",
          header: "Order ID",
          size: 200,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "amount",
          header: "Amount",
          size: 100,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "currency",
          header: "Currency",
          size: 180,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "upi_id",
          header: "UPI ID",
          size: 140,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "bank",
          header: "Bank",
          size: 160,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "receipt",
          header: "Receipt",
          size: 180,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "verified",
          header: "Verified",
          size: 10,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "signature",
          header: "Signature",
          size: 170,
          muiFilterTextFieldProps: defaultFilterProps,
        },
        {
          accessorKey: "installment_type",
          header: "Installment Type",
          size: 140,
          muiFilterTextFieldProps: defaultFilterProps,
        },
      ],
    },
  ];
}
