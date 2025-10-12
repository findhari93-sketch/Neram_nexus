import React, { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import GoogleIcon from "@mui/icons-material/Google";
import { Edit, Delete } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { supabase } from "../../lib/supabaseClient";
import { initialUserData, userColumns } from "./WebUsersData";
import WebUsersDrawer from "../../components/pages/admin/comp/WebUsersDrawer";

const WebUsers = () => {
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Callback for drawer save
  const handleDrawerSaved = (patch) => {
    if (!patch?.id) return;
    setData((prev) =>
      prev.map((item) => (item.id === patch.id ? { ...item, ...patch } : item))
    );
  };
  // Callback for drawer delete
  const handleDrawerDeleted = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    setDrawerOpen(false);
    setSelectedUserId(null);
  };
  const [validationErrors, setValidationErrors] = useState({});
  const { dateRange } = useOutletContext() || {};
  const [data, setData] = useState(initialUserData);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchInfo, setFetchInfo] = useState({
    rows: 0,
    count: null,
    error: null,
  });
  const [isMutating, setIsMutating] = useState(false);
  const [alert, setAlert] = useState(null); // { color, children }

  // Validation functions
  const validateRequired = (value) => !!value.length;
  const validateEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };
  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  };

  // Update handlers (create is disabled for this table)

  const handleSaveWebUser = async ({ values, table, row }) => {
    const newValidationErrors = {};
    if (!validateRequired(values.student_name || "")) {
      newValidationErrors.student_name = "Student Name is required";
    }
    if (!validateRequired(values.email)) {
      newValidationErrors.email = "Email is Required";
    } else if (!validateEmail(values.email)) {
      newValidationErrors.email = "Invalid Email Format";
    }
    if (!validateRequired(values.phone || "")) {
      newValidationErrors.phone = "Phone is Required";
    } else if (!validatePhone(values.phone)) {
      newValidationErrors.phone = "Invalid Phone Format";
    }

    if (Object.keys(newValidationErrors).length) {
      setValidationErrors(newValidationErrors);
      return;
    }

    setValidationErrors({});

    // Only send editable fields to Supabase
    const editableKeys = [
      "student_name",
      "email",
      "phone",
      "education_type",
      "selected_course",
      "payment_type",
      "course_fee",
      "discount",
      "total_payable",
    ];

    const numberKeys = new Set(["course_fee", "discount", "total_payable"]);
    const payload = editableKeys.reduce((acc, key) => {
      if (key in values) {
        let v = values[key];
        if (numberKeys.has(key)) {
          v = v === "" || v === null || v === undefined ? null : Number(v);
        }
        acc[key] = v;
      }
      return acc;
    }, {});

    // Determine target id reliably
    const targetId = values?.id ?? row?.original?.id;

    // Optimistic update
    const prevData = data;
    setData((prev) =>
      prev.map((item) =>
        item.id === targetId
          ? { ...item, ...payload, updated_at: new Date().toISOString() }
          : item
      )
    );
    table.setEditingRow(null);

    setIsMutating(true);
    const { data: updatedRows, error: updateError } = await supabase
      .from("users")
      .update(payload)
      .eq("id", targetId)
      .select("id, updated_at");
    setIsMutating(false);
    if (updateError) {
      console.error("Supabase update error:", updateError);
      setAlert({
        color: "error",
        children: `Update failed: ${updateError.message}`,
      });
      // rollback
      setData(prevData);
      return;
    }
    if (!updatedRows || updatedRows.length === 0) {
      console.warn("Supabase update affected 0 rows", { targetId, payload });
      // Try to diagnose if row is visible via SELECT
      const { data: rowCheck } = await supabase
        .from("users")
        .select("id")
        .eq("id", targetId)
        .maybeSingle();
      const msg = rowCheck
        ? "No row was updated. SELECT works, but UPDATE is likely blocked by RLS (add UPDATE policy for anon)."
        : "No row was updated. Could not SELECT the row either (id mismatch or SELECT policy).";
      setAlert({ color: "warning", children: msg });
      // rollback
      setData(prevData);
      return;
    }
    setAlert({ color: "success", children: "Row updated successfully" });
  };

  // Fetch from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    (async () => {
      const {
        data: rows,
        error,
        count,
      } = await supabase
        .from("users")
        .select("*", { count: "exact", head: false })
        .limit(1000);
      if (!isMounted) return;
      if (error) {
        console.error("Supabase fetch error:", error);
        setFetchInfo({ rows: 0, count: null, error });
        setIsLoading(false);
        return; // keep initialUserData fallback on error
      }
      const rowCount = Array.isArray(rows) ? rows.length : 0;
      console.debug("Supabase users fetched:", { rowCount, count });
      setFetchInfo({ rows: rowCount, count: count ?? null, error: null });
      if (Array.isArray(rows)) {
        setData(rows);
      }
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const openDeleteConfirmModal = async (row) => {
    if (!window.confirm("Are you sure you want to delete this web user?"))
      return;

    const prevData = data;
    const id = row.original.id;
    // Optimistic remove
    setData((prev) => prev.filter((item) => item.id !== id));

    setIsMutating(true);
    const { data: deletedRows, error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select("id");
    setIsMutating(false);
    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      setAlert({
        color: "error",
        children: `Delete failed: ${deleteError.message}`,
      });
      // rollback
      setData(prevData);
      return;
    }
    if (!deletedRows || deletedRows.length === 0) {
      console.warn("Supabase delete affected 0 rows", { id });
      // Diagnose similarly by attempting to SELECT the row
      const { data: rowCheck } = await supabase
        .from("users")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      const msg = rowCheck
        ? "No row was deleted. SELECT works, but DELETE is likely blocked by RLS (add DELETE policy for anon)."
        : "No row was deleted. Could not SELECT the row either (id mismatch or SELECT policy).";
      setAlert({ color: "warning", children: msg });
      // rollback (row still exists)
      setData(prevData);
      return;
    }
    setAlert({ color: "success", children: "Row deleted" });
  };

  // Columns configuration
  const columns = useMemo(() => {
    const editableKeys = new Set([
      "student_name",
      "email",
      "phone",
      "education_type",
      "selected_course",
      "payment_type",
      "course_fee",
      "discount",
      "total_payable",
    ]);

    const numberKeys = new Set(["course_fee", "discount", "total_payable"]);
    const dateKeys = new Set([
      "created_at",
      "updated_at",
      "last_sign_in",
      "dob",
    ]);
    const arrayKeys = new Set(["providers", "interests"]);
    const boolKeys = new Set(["phone_auth_used"]);
    const objectKeys = new Set([
      "google_info",
      "profile",
      "application",
      "nata_calculator_sessions",
    ]);
    const systemKeys = new Set([
      "id",
      "legacy_external_id",
      "firebase_uid",
      "avatar_path",
      "nata_calculator_sessions",
    ]);

    const priorityOrder = ["created_at", "providers", "student_name"];
    const ordered = [...userColumns].sort((a, b) => {
      const ia = priorityOrder.indexOf(a.accessorKey);
      const ib = priorityOrder.indexOf(b.accessorKey);
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    return ordered.map((col) => {
      const key = col.accessorKey;
      const base = { ...col };
      base.enableEditing = editableKeys.has(key);
      if (col.minWidth) {
        base.minSize = col.minWidth;
        base.muiTableHeadCellProps = {
          ...(base.muiTableHeadCellProps || {}),
          sx: { minWidth: col.minWidth },
        };
        base.muiTableBodyCellProps = {
          ...(base.muiTableBodyCellProps || {}),
          sx: { minWidth: col.minWidth },
        };
      }

      if (numberKeys.has(key)) {
        base.muiEditTextFieldProps = {
          type: "number",
          inputProps: { step: "0.01" },
        };
        base.Cell = ({ cell }) => {
          const v = cell.getValue();
          return v === undefined || v === null || v === ""
            ? ""
            : Number(v).toFixed(2);
        };
      }

      if (key === "email") {
        base.muiEditTextFieldProps = {
          ...(base.muiEditTextFieldProps || {}),
          type: "email",
          required: true,
          error: !!validationErrors?.email,
          helperText: validationErrors?.email,
          onFocus: () =>
            setValidationErrors((e) => ({ ...e, email: undefined })),
        };
      }

      if (key === "student_name") {
        base.muiEditTextFieldProps = {
          ...(base.muiEditTextFieldProps || {}),
          required: true,
          error: !!validationErrors?.student_name,
          helperText: validationErrors?.student_name,
          onFocus: () =>
            setValidationErrors((e) => ({ ...e, student_name: undefined })),
        };
      }

      if (key === "phone") {
        base.muiEditTextFieldProps = {
          ...(base.muiEditTextFieldProps || {}),
          required: true,
          error: !!validationErrors?.phone,
          helperText: validationErrors?.phone,
          onFocus: () =>
            setValidationErrors((e) => ({ ...e, phone: undefined })),
        };
      }

      if (arrayKeys.has(key)) {
        base.enableEditing = false;
        // Custom icon rendering for providers
        if (key === "providers") {
          base.Cell = ({ cell }) => {
            const arr = cell.getValue();
            if (!Array.isArray(arr) || arr.length === 0) return "";
            return (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {arr.map((item, idx) => {
                  if (item === "password") {
                    return (
                      <Tooltip key={idx} title="Password">
                        <LockIcon fontSize="small" sx={{ color: "#888" }} />
                      </Tooltip>
                    );
                  }
                  if (item === "phone") {
                    return (
                      <Tooltip key={idx} title="Phone">
                        <PhoneIphoneIcon
                          fontSize="small"
                          sx={{ color: "#1976d2" }}
                        />
                      </Tooltip>
                    );
                  }
                  if (item === "google" || item === "google.com") {
                    return (
                      <Tooltip key={idx} title="Google">
                        <GoogleIcon
                          fontSize="small"
                          sx={{ color: "#ea4335" }}
                        />
                      </Tooltip>
                    );
                  }
                  // fallback for other providers
                  return <Chip key={idx} label={String(item)} size="small" />;
                })}
              </Box>
            );
          };
        } else {
          base.Cell = ({ cell }) => {
            const arr = cell.getValue();
            if (!Array.isArray(arr) || arr.length === 0) return "";
            return (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {arr.map((item, idx) => (
                  <Chip key={idx} label={String(item)} size="small" />
                ))}
              </Box>
            );
          };
        }
      }

      if (boolKeys.has(key)) {
        base.editVariant = "select";
        base.editSelectOptions = [true, false];
        base.Cell = ({ cell }) => {
          const v = cell.getValue();
          return (
            <Chip
              size="small"
              color={v ? "success" : "default"}
              label={v ? "Yes" : "No"}
            />
          );
        };
      }

      if (dateKeys.has(key)) {
        base.enableEditing = false;
        if (key === "created_at") {
          base.Cell = ({ cell }) => {
            const v = cell.getValue();
            if (!v) return "";
            const d = new Date(v);
            if (isNaN(d.getTime())) return String(v);
            // Format as DD-MMM-YY (e.g., 10-Oct-25)
            const day = String(d.getDate()).padStart(2, "0");
            const month = d.toLocaleString("en-US", { month: "short" });
            const year = String(d.getFullYear()).slice(-2);
            const dateStr = `${day}-${month}-${year}`;
            const timeStr = d.toLocaleTimeString();
            return (
              <Tooltip title={timeStr} placement="top" arrow>
                <span>{dateStr}</span>
              </Tooltip>
            );
          };
        } else {
          base.Cell = ({ cell }) => {
            const v = cell.getValue();
            if (!v) return "";
            const d = new Date(v);
            return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
          };
        }
      }

      if (objectKeys.has(key)) {
        base.enableEditing = false;
        base.Cell = ({ cell }) => {
          const obj = cell.getValue();
          if (!obj || typeof obj !== "object") return "";
          try {
            return (
              <Typography
                component="span"
                sx={{ fontFamily: "monospace", fontSize: 12 }}
              >
                {JSON.stringify(obj)}
              </Typography>
            );
          } catch {
            return String(obj);
          }
        };
      }

      if (systemKeys.has(key)) {
        base.enableEditing = false;
      }

      return base;
    });
  }, [validationErrors]);

  // Table configuration
  // Apply client-side filter based on dateRange to the fetched data
  const filteredData = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) return data;
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    // normalize boundaries
    const startMs = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      0,
      0,
      0,
      0
    ).getTime();
    const endMs = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      23,
      59,
      59,
      999
    ).getTime();
    return data.filter((row) => {
      const ts = row?.created_at ? new Date(row.created_at).getTime() : NaN;
      return !Number.isNaN(ts) && ts >= startMs && ts <= endMs;
    });
  }, [data, dateRange]);

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    editDisplayMode: "row",
    enableEditing: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableColumnPinning: true,
    positionActionsColumn: "first",
    initialState: {
      columnPinning: {
        left: ["mrt-row-actions", "created_at", "providers", "student_name"],
        right: [],
      },
    },
    displayColumnDefOptions: {},
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: alert
      ? alert
      : fetchInfo.error
      ? {
          color: "error",
          children: `Error loading data: ${fetchInfo.error.message}`,
        }
      : fetchInfo.rows === 0
      ? {
          color: "warning",
          children:
            "No rows received from Supabase. If you expected data, check that the 'users' table has rows and that RLS policies allow SELECT for anon.",
        }
      : undefined,
    muiTableContainerProps: { sx: { maxHeight: "calc(100vh - 14.5rem)" } },
    muiTableProps: {},
    muiTableHeadCellProps: {
      sx: {
        borderRight: "1px solid",
        borderRightColor: "divider",
        "&:last-of-type": { borderRight: "none" },
      },
    },
    muiTopToolbarProps: {},
    muiBottomToolbarProps: {},
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveWebUser,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Open">
          <IconButton
            color="primary"
            onClick={() => {
              setSelectedUserId(row.original.id);
              setDrawerOpen(true);
            }}
            sx={{
              opacity: 0,
              transition: "opacity 0.2s",
              ".MuiTableRow-root:hover &": {
                opacity: 1,
              },
            }}
          >
            <span className="material-icons">open_in_new</span>
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton
            onClick={() => table.setEditingRow(row)}
            sx={{
              opacity: 0,
              transition: "opacity 0.2s",
              ".MuiTableRow-root:hover &": {
                opacity: 1,
              },
            }}
          >
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() => openDeleteConfirmModal(row)}
            sx={{
              opacity: 0,
              transition: "opacity 0.2s",
              ".MuiTableRow-root:hover &": {
                opacity: 1,
              },
            }}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    // No custom top toolbar actions (add disabled)
    state: {
      isLoading,
      showAlertBanner:
        Boolean(alert) || Boolean(fetchInfo.error) || fetchInfo.rows === 0,
      isSaving: isMutating,
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />
      {/* Drawer integration */}
      {drawerOpen && selectedUserId && (
        <React.Suspense fallback={null}>
          {/* Lazy import for code splitting, or direct import if preferred */}
          <WebUsersDrawer
            open={drawerOpen}
            userId={selectedUserId}
            onClose={() => setDrawerOpen(false)}
            onSaved={handleDrawerSaved}
            onDeleted={handleDrawerDeleted}
          />
        </React.Suspense>
      )}
    </>
  );
};

export default WebUsers;
