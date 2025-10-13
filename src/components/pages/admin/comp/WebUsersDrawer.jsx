import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Grid2,
  Avatar,
  Typography,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import InfoCard from "../../../../components/Shared/InfoCard";
import BigDrawer from "../../../../components/Shared/BigDrawer";
import { supabase } from "../../../../lib/supabaseClient";

// Stable, memoized EditDialog component defined at module scope
const EditDialog = React.memo(function EditDialog({
  open,
  cfg,
  values,
  saving,
  errors,
  onClose,
  onChange,
  onSubmit,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      keepMounted
    >
      {cfg ? (
        <>
          <DialogTitle>{cfg.title}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              {(cfg.fields || []).map((f) =>
                f.type === "select" ? (
                  <TextField
                    key={f.key}
                    select
                    label={f.label}
                    size="small"
                    value={values?.[f.key] ?? ""}
                    onChange={onChange(f.key)}
                    fullWidth
                    autoFocus={false}
                    error={Boolean(errors?.[f.key])}
                    helperText={errors?.[f.key] || ""}
                  >
                    {(f.options || []).map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    key={f.key}
                    label={f.label}
                    size="small"
                    type={
                      f.type === "number"
                        ? "number"
                        : f.type === "date"
                        ? "date"
                        : "text"
                    }
                    value={values?.[f.key] ?? ""}
                    onChange={onChange(f.key)}
                    fullWidth
                    multiline={f.type === "multiline"}
                    minRows={f.type === "multiline" ? 3 : undefined}
                    autoFocus={false}
                    error={Boolean(errors?.[f.key])}
                    helperText={errors?.[f.key] || ""}
                  />
                )
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              variant="contained"
              disabled={saving || Boolean(errors && Object.keys(errors).length)}
            >
              Save
            </Button>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
});

const WebUsersDrawer = ({ open, userId, onClose, onSaved, onDeleted }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "success",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Undo handled via dialog actions (if any) — footer actions removed for this drawer

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()
        .then(({ data, error }) => {
          setUser(data || null);
          setLoading(false);
        });
    }
  }, [open, userId]);

  // Derived flags
  const isFree = (user?.account_type || "").toLowerCase() === "free";

  // Helpers for display formatting
  const fmtArray = (arr) => (Array.isArray(arr) ? arr.join(", ") : arr || "-");
  const fmtBool = (v) => (v ? "Yes" : v === false ? "No" : "-");
  const fmtDateTime = (v) => {
    if (!v) return "-";
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return String(v);
      return d.toLocaleString();
    } catch {
      return String(v);
    }
  };

  // Date helpers for input and DB
  const toDateInputValue = (v) => {
    if (!v) return "";
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return "";
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return "";
    }
  };
  const normalizeDateForDb = (v) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    if (!s) return null; // empty -> null to satisfy Postgres date
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // already yyyy-mm-dd
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Select helpers
  const mapToOptionCaseInsensitive = (options, val) => {
    if (val === undefined || val === null) return "";
    const s = String(val).toLowerCase();
    const match = (options || []).find(
      (opt) => String(opt).toLowerCase() === s
    );
    return match ?? "";
  };

  // Reusable key-value list to match desired design
  const KeyValueList = ({ rows }) => (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      {rows.map(({ label, value }, idx) => (
        <Box
          key={idx}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1.25fr",
            alignItems: "baseline",
            gap: 1,
            py: 0.5,
          }}
        >
          <Typography
            variant="body2"
            color="text.primary"
            sx={{ textAlign: "right", opacity: 0.7 }}
          >
            {label}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ px: 1 }}>
            :
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {value ?? "-"}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  // Edit dialog state and helpers
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogCardKey, setEditDialogCardKey] = useState(null);
  const [editDialogValues, setEditDialogValues] = useState({});
  const [editDialogSaving, setEditDialogSaving] = useState(false);

  const openEditDialog = useCallback(
    (cardKey) => {
      if (!user) return;
      const cfg = getEditConfig(cardKey);
      if (!cfg) return;
      const values = {};
      cfg.fields.forEach((f) => {
        const v = user[f.key];
        if (f.key === "interests") {
          values[f.key] = Array.isArray(v) ? v.join(", ") : v || "";
        } else if (f.type === "select") {
          values[f.key] = mapToOptionCaseInsensitive(f.options, v);
        } else if (f.type === "date") {
          values[f.key] = toDateInputValue(v);
        } else {
          values[f.key] = v ?? f.default ?? "";
        }
      });
      setEditDialogCardKey(cardKey);
      setEditDialogValues(values);
      setEditDialogOpen(true);
      setEditDialogSaving(false);
    },
    [user]
  );

  const closeEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setEditDialogCardKey(null);
    setEditDialogValues({});
    setEditDialogSaving(false);
  }, []);

  const handleEditChange = useCallback(
    (key) => (e) => {
      const value = e.target.value;
      setEditDialogValues((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Save handler for any card (move above submitEditDialog)
  const handleSave = React.useCallback(
    async (patch, cardKey) => {
      if (!userId || !patch || Object.keys(patch).length === 0) return;
      const { data: updatedRows, error } = await supabase
        .from("users")
        .update(patch)
        .eq("id", userId)
        .select("id, updated_at");
      if (error || !updatedRows || updatedRows.length === 0) {
        // Optional logging to help debug Supabase errors
        if (error) {
          // eslint-disable-next-line no-console
          console.error("Supabase users update error", {
            cardKey,
            patch,
            error,
          });
        }
        setSnackbar({
          open: true,
          message: error ? error.message : "No row updated; check RLS.",
          color: "error",
        });
        return;
      }
      setUser((prev) => ({
        ...prev,
        ...patch,
        updated_at: updatedRows[0].updated_at,
      }));
      setSnackbar({
        open: true,
        message: "Saved successfully",
        color: "success",
      });
      if (onSaved) onSaved({ id: userId, ...patch });
    },
    [userId, onSaved]
  );

  const submitEditDialog = useCallback(async () => {
    if (!editDialogCardKey) return;
    const cfg = getEditConfig(editDialogCardKey);
    if (!cfg) return;
    // Basic validation: required fields
    const requiredErrors = {};
    (cfg.fields || []).forEach((f) => {
      if (f.required) {
        const raw = editDialogValues[f.key];
        const s = typeof raw === "string" ? raw.trim() : raw;
        if (!s) requiredErrors[f.key] = `${f.label} is required`;
      }
    });
    if (Object.keys(requiredErrors).length) {
      setSnackbar({
        open: true,
        message: "Please fill required fields.",
        color: "error",
      });
      return;
    }
    // Build patch with type conversions
    const patch = {};
    cfg.fields.forEach((f) => {
      let val = editDialogValues[f.key];
      if (f.type === "number") {
        const n = parseFloat(val);
        val = Number.isNaN(n) ? null : n;
      } else if (f.type === "arrayCsv") {
        val =
          typeof val === "string" && val.trim().length
            ? val
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
      } else if (f.type === "select") {
        // Preserve exact casing; treat empty as null
        val = val === "" ? null : val;
      } else if (f.type === "date") {
        val = normalizeDateForDb(val);
      } else if (f.type === "text" || f.type === "multiline") {
        val = typeof val === "string" ? val.trim() : val;
      }
      patch[f.key] = val;
    });
    setEditDialogSaving(true);
    await handleSave(patch, editDialogCardKey);
    setEditDialogSaving(false);
    closeEditDialog();
  }, [editDialogCardKey, editDialogValues, handleSave, closeEditDialog]);

  // Config per card for editable fields
  const getEditConfig = (cardKey) => {
    const basic = {
      key: "basic",
      title: "Edit Basic Info",
      fields: [
        { key: "student_name", label: "Name", type: "text", required: true },
        { key: "father_name", label: "Father Name", type: "text" },
        {
          key: "gender",
          label: "Gender",
          type: "select",
          options: ["Male", "Female", "Other"],
        },
        { key: "dob", label: "Date of Birth", type: "date" },
        { key: "username", label: "Username", type: "text" },
        { key: "bio", label: "Bio", type: "multiline" },
        {
          key: "account_type",
          label: "Account Type",
          type: "select",
          options: ["Free", "Paid"],
        },
        {
          key: "interests",
          label: "Interests (comma separated)",
          type: "arrayCsv",
        },
      ],
    };
    const contact = {
      key: "contact",
      title: "Edit Contact & Address",
      fields: [
        { key: "email", label: "Email", type: "text" },
        { key: "phone", label: "Phone", type: "text" },
        { key: "instagram_handle", label: "Instagram Handle", type: "text" },
        { key: "zip_code", label: "Zip Code", type: "text" },
        { key: "city", label: "City", type: "text" },
        { key: "state", label: "State", type: "text" },
        { key: "country", label: "Country", type: "text" },
      ],
    };
    const education = {
      key: "education",
      title: "Edit Education",
      fields: [
        { key: "education_type", label: "Education Type", type: "text" },
        { key: "selected_course", label: "Selected Course", type: "text" },
        { key: "school_std", label: "School Std", type: "text" },
        { key: "board", label: "Board", type: "text" },
        { key: "board_year", label: "Board Year", type: "text" },
        { key: "school_name", label: "School Name", type: "text" },
        { key: "college_name", label: "College Name", type: "text" },
        { key: "college_year", label: "College Year", type: "text" },
        { key: "diploma_course", label: "Diploma Course", type: "text" },
        { key: "diploma_year", label: "Diploma Year", type: "text" },
        { key: "diploma_college", label: "Diploma College", type: "text" },
        { key: "nata_attempt_year", label: "NATA Attempt Year", type: "text" },
      ],
    };
    const course = {
      key: "course",
      title: "Edit Course & Payments",
      fields: [
        { key: "course_fee", label: "Course Fee", type: "number" },
        { key: "discount", label: "Discount", type: "number" },
        { key: "total_payable", label: "Total Payable", type: "number" },
        { key: "payment_type", label: "Payment Type", type: "text" },
        { key: "selected_course", label: "Selected Course", type: "text" },
      ],
    };
    switch (cardKey) {
      case "basic":
        return basic;
      case "contact":
        return contact;
      case "education":
        return education;
      case "course":
        return course;
      default:
        return null;
    }
  };

  // compute edit config on each render (cheap). Dialog stays mounted; open controls visibility.
  const editCfg = editDialogCardKey ? getEditConfig(editDialogCardKey) : null;
  const editErrors = useMemo(() => {
    const errs = {};
    if (!editCfg) return errs;
    (editCfg.fields || []).forEach((f) => {
      if (f.required) {
        const raw = editDialogValues[f.key];
        const s = typeof raw === "string" ? raw.trim() : raw;
        if (!s) errs[f.key] = `${f.label} is required`;
      }
    });
    return errs;
  }, [editCfg, editDialogValues]);

  // Delete handler
  const handleDelete = async () => {
    setIsDeleting(true);
    const { data: deletedRows, error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId)
      .select("id");
    setIsDeleting(false);
    if (error || !deletedRows || deletedRows.length === 0) {
      setSnackbar({
        open: true,
        message: error ? error.message : "No row deleted; check RLS.",
        color: "error",
      });
      return;
    }
    setSnackbar({ open: true, message: "User deleted", color: "success" });
    if (onDeleted) onDeleted(userId);
    onClose();
  };

  // (legacy) Card edit toggles removed; dialog-based editing used instead

  // Card content: display all user data grouped by category, read-only for now
  const BasicInfoCard = () => {
    const getInitials = (name = "") => {
      const parts = String(name).trim().split(/\s+/);
      const first = parts[0]?.[0] || "";
      const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
      return (first + last).toUpperCase();
    };

    // Try to extract a Google profile photo URL
    const resolveProfilePhotoUrl = () => {
      const tryExtract = (obj) => {
        if (!obj) return null;
        try {
          const o = typeof obj === "string" ? JSON.parse(obj) : obj;
          return (
            o?.picture ||
            o?.photoURL ||
            o?.image?.url ||
            (Array.isArray(o?.photos) ? o.photos[0]?.value : null) ||
            o?.picture_url ||
            o?.pictureUrl ||
            null
          );
        } catch {
          // if profile is a raw URL string
          if (typeof obj === "string" && /^https?:\/\//i.test(obj)) return obj;
          return null;
        }
      };

      return tryExtract(user?.profile) || tryExtract(user?.google_info) || null;
    };

    const resolveAvatarUrl = () => {
      const p = user?.avatar_path;
      if (!p || typeof p !== "string") return null;
      if (/^https?:\/\//i.test(p)) return p;
      try {
        const { data } = supabase.storage.from("avatars").getPublicUrl(p);
        return data?.publicUrl || null;
      } catch {
        return null;
      }
    };

    const displayName = user?.student_name || user?.username || "User";
    const photoUrl = resolveProfilePhotoUrl() || resolveAvatarUrl();
    const initials = getInitials(displayName);

    return (
      <InfoCard
        title="Basic Info"
        isEditing={false}
        onEdit={() => openEditDialog("basic")}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Avatar
              src={photoUrl || undefined}
              imgProps={{ referrerPolicy: "no-referrer" }}
              sx={{
                width: 72,
                height: 72,
                fontWeight: 700,
                fontSize: 22,
                bgcolor: "background.paper",
                color: "text.primary",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {!photoUrl && initials}
            </Avatar>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" fontWeight={700}>
                {displayName}
              </Typography>
              {user?.email && (
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              )}
            </Box>
          </Box>
          <KeyValueList
            rows={[
              { label: "Father Name", value: user?.father_name || "-" },
              { label: "Gender", value: user?.gender || "-" },
              { label: "Date of Birth", value: user?.dob || "-" },
              { label: "Username", value: user?.username || "-" },
              { label: "Bio", value: user?.bio || "-" },
              { label: "Account Type", value: user?.account_type || "-" },
              { label: "Interests", value: fmtArray(user?.interests) },
              { label: "Description", value: user?.other_description || "-" },
              { label: "ID", value: user?.id || "-" },
            ]}
          />
        </Box>
      </InfoCard>
    );
  };

  const ContactAddressCard = () => (
    <InfoCard
      title="Contact & Address"
      isEditing={false}
      onEdit={() => openEditDialog("contact")}
    >
      <KeyValueList
        rows={[
          { label: "Email", value: user?.email || "-" },
          { label: "Phone", value: user?.phone || "-" },
          { label: "Instagram Handle", value: user?.instagram_handle || "-" },
          { label: "Providers", value: fmtArray(user?.providers) },
          { label: "Zip Code", value: user?.zip_code || "-" },
          { label: "City", value: user?.city || "-" },
          { label: "State", value: user?.state || "-" },
          { label: "Country", value: user?.country || "-" },
        ]}
      />
    </InfoCard>
  );

  const EducationCard = () => (
    <InfoCard
      title="Education"
      isEditing={false}
      onEdit={() => openEditDialog("education")}
    >
      <KeyValueList
        rows={[
          { label: "Education Type", value: user?.education_type || "-" },
          { label: "Selected Course", value: user?.selected_course || "-" },
          { label: "School Std", value: user?.school_std || "-" },
          { label: "Board", value: user?.board || "-" },
          { label: "Board Year", value: user?.board_year || "-" },
          { label: "School Name", value: user?.school_name || "-" },
          { label: "College Name", value: user?.college_name || "-" },
          { label: "College Year", value: user?.college_year || "-" },
          { label: "Diploma Course", value: user?.diploma_course || "-" },
          { label: "Diploma Year", value: user?.diploma_year || "-" },
          { label: "Diploma College", value: user?.diploma_college || "-" },
          { label: "NATA Attempt Year", value: user?.nata_attempt_year || "-" },
        ]}
      />
    </InfoCard>
  );

  const CourseCard = () =>
    !isFree ? (
      <InfoCard
        title="Course & Payments"
        isEditing={null}
        onEdit={() => openEditDialog("course")}
      >
        <KeyValueList
          rows={[
            { label: "Course Fee", value: user?.course_fee ?? "-" },
            { label: "Discount", value: user?.discount ?? "-" },
            { label: "Total Payable", value: user?.total_payable ?? "-" },
            { label: "Payment Type", value: user?.payment_type || "-" },
            { label: "Selected Course", value: user?.selected_course || "-" },
          ]}
        />
      </InfoCard>
    ) : null;

  const ActivityCard = () => (
    <InfoCard title="Activity" isEditing={null}>
      <KeyValueList
        rows={[
          { label: "Last Sign In", value: fmtDateTime(user?.last_sign_in) },
          { label: "Created At", value: fmtDateTime(user?.created_at) },
          { label: "Updated At", value: fmtDateTime(user?.updated_at) },
        ]}
      />
    </InfoCard>
  );

  const NataCalculatorCard = () => (
    <InfoCard title="NATA Calculator Sessions" isEditing={null}>
      <KeyValueList
        rows={[
          {
            label: "Sessions",
            value: Array.isArray(user?.nata_calculator_sessions)
              ? user.nata_calculator_sessions.length
              : 0,
          },
        ]}
      />
    </InfoCard>
  );

  const AuthAccountsCard = () => (
    <InfoCard title="Auth Accounts" isEditing={null}>
      <KeyValueList
        rows={[
          { label: "Google Connected", value: fmtBool(!!user?.google_info) },
          { label: "Phone Auth Used", value: fmtBool(user?.phone_auth_used) },
          { label: "Firebase UID", value: user?.firebase_uid || "-" },
          {
            label: "Legacy External ID",
            value: user?.legacy_external_id || "-",
          },
        ]}
      />
    </InfoCard>
  );

  // Other cards: ContactAddressCard, EducationCard, CourseCard, ActivityCard, NataCalculatorCard, AuthAccountsCard
  // ...implement similarly, passing correct fields and handlers

  if (!open) return null;
  const headerActions = [
    <IconButton
      key="delete"
      color="error"
      onClick={() => setDeleteDialogOpen(true)}
    >
      <span className="material-icons">delete</span>
    </IconButton>,
  ];

  return (
    <BigDrawer
      open={open}
      onClose={onClose}
      hideFooter={true}
      headerActions={headerActions}
      title={
        user?.student_name
          ? `${user.student_name} - User Details`
          : "User Details"
      }
    >
      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Drawer header actions moved into BigDrawer header */}
          {/* Cards container: let this fill remaining space and scroll */}
          <Box sx={{ overflowY: "auto", flex: 1, pr: 1 }}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <BasicInfoCard />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ContactAddressCard />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <EducationCard />
              </Grid2>
              {!isFree && (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <CourseCard />
                </Grid2>
              )}
              <Grid2 size={{ xs: 12, md: 6 }}>
                <ActivityCard />
                <AuthAccountsCard />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <NataCalculatorCard />
              </Grid2>
            </Grid2>
          </Box>
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" disabled={isDeleting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        ContentProps={{
          sx: {
            background: snackbar.color === "error" ? "#dc004e" : "#347DA2",
            color: "#fff",
          },
        }}
      />
      <EditDialog
        open={editDialogOpen}
        cfg={editCfg}
        values={editDialogValues}
        saving={editDialogSaving}
        errors={editErrors}
        onClose={closeEditDialog}
        onChange={handleEditChange}
        onSubmit={submitEditDialog}
      />
    </BigDrawer>
  );
};

export default WebUsersDrawer;
