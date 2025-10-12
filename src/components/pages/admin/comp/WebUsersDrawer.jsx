import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import InfoCard from "../../../../components/Shared/InfoCard";
import BigDrawer from "../../../../components/Shared/BigDrawer";
import { supabase } from "../../../../lib/supabaseClient";

const WebUsersDrawer = ({ open, userId, onClose, onSaved, onDeleted }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editState, setEditState] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "success",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Undo all handler
  const handleUndoAll = () => {
    // Reset all edit states and reload user data from supabase
    if (!userId) return;
    setLoading(true);
    supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        setUser(data || null);
        setError(error);
        setLoading(false);
        setEditState({});
        setSnackbar({
          open: true,
          message: error ? "Undo failed" : "All changes reverted",
          color: error ? "error" : "success",
        });
      });
  };

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
          setError(error);
          setLoading(false);
        });
    }
  }, [open, userId]);

  // Save handler for any card
  const handleSave = async (patch, cardKey) => {
    if (!userId || !patch || Object.keys(patch).length === 0) return;
    setEditState((prev) => ({ ...prev, [cardKey]: { loading: true } }));
    const { data: updatedRows, error } = await supabase
      .from("users")
      .update(patch)
      .eq("id", userId)
      .select("id, updated_at");
    if (error || !updatedRows || updatedRows.length === 0) {
      setSnackbar({
        open: true,
        message: error ? error.message : "No row updated; check RLS.",
        color: "error",
      });
      setEditState((prev) => ({ ...prev, [cardKey]: { loading: false } }));
      return;
    }
    setUser((prev) => ({
      ...prev,
      ...patch,
      updated_at: updatedRows[0].updated_at,
    }));
    setEditState((prev) => ({
      ...prev,
      [cardKey]: { loading: false, editing: false },
    }));
    setSnackbar({
      open: true,
      message: "Saved successfully",
      color: "success",
    });
    if (onSaved) onSaved({ id: userId, ...patch });
  };

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

  // Card edit toggles
  const toggleEdit = (cardKey) =>
    setEditState((prev) => ({
      ...prev,
      [cardKey]: { editing: !prev[cardKey]?.editing },
    }));
  const cancelEdit = (cardKey) =>
    setEditState((prev) => ({ ...prev, [cardKey]: { editing: false } }));

  // Card content: display all user data grouped by category, read-only for now
  const BasicInfoCard = () => (
    <InfoCard title="Basic Info" isEditing={false}>
      <Box>
        <strong>Name:</strong> {user?.student_name}
        <br />
        <strong>Father Name:</strong> {user?.father_name}
        <br />
        <strong>Gender:</strong> {user?.gender}
        <br />
        <strong>Date of Birth:</strong> {user?.dob}
        <br />
        <strong>Username:</strong> {user?.username}
        <br />
        <strong>Bio:</strong> {user?.bio}
        <br />
        <strong>Account Type:</strong> {user?.account_type}
        <br />
        <strong>Interests:</strong>{" "}
        {Array.isArray(user?.interests) ? user.interests.join(", ") : ""}
        <br />
        <strong>Description:</strong> {user?.other_description}
        <br />
        <strong>ID:</strong> {user?.id}
      </Box>
    </InfoCard>
  );

  const ContactAddressCard = () => (
    <InfoCard title="Contact & Address" isEditing={false}>
      <Box>
        <strong>Email:</strong> {user?.email}
        <br />
        <strong>Phone:</strong> {user?.phone}
        <br />
        <strong>Phone Auth Used:</strong> {user?.phone_auth_used ? "Yes" : "No"}
        <br />
        <strong>Instagram Handle:</strong> {user?.instagram_handle}
        <br />
        <strong>Last Sign In:</strong> {user?.last_sign_in}
        <br />
        <strong>Providers:</strong>{" "}
        {Array.isArray(user?.providers) ? user.providers.join(", ") : ""}
        <br />
        <strong>Zip Code:</strong> {user?.zip_code}
        <br />
        <strong>City:</strong> {user?.city}
        <br />
        <strong>State:</strong> {user?.state}
        <br />
        <strong>Country:</strong> {user?.country}
      </Box>
    </InfoCard>
  );

  const EducationCard = () => (
    <InfoCard title="Education" isEditing={false}>
      <Box>
        <strong>Education Type:</strong> {user?.education_type}
        <br />
        <strong>Selected Course:</strong> {user?.selected_course}
        <br />
        <strong>School Std:</strong> {user?.school_std}
        <br />
        <strong>Board:</strong> {user?.board}
        <br />
        <strong>Board Year:</strong> {user?.board_year}
        <br />
        <strong>School Name:</strong> {user?.school_name}
        <br />
        <strong>College Name:</strong> {user?.college_name}
        <br />
        <strong>College Year:</strong> {user?.college_year}
        <br />
        <strong>Diploma Course:</strong> {user?.diploma_course}
        <br />
        <strong>Diploma Year:</strong> {user?.diploma_year}
        <br />
        <strong>Diploma College:</strong> {user?.diploma_college}
        <br />
        <strong>NATA Attempt Year:</strong> {user?.nata_attempt_year}
      </Box>
    </InfoCard>
  );

  const CourseCard = () =>
    user?.account_type !== "Free" ? (
      <InfoCard title="Course & Payments" isEditing={null}>
        <Box>
          <strong>Course Fee:</strong> {user?.course_fee}
          <br />
          <strong>Discount:</strong> {user?.discount}
          <br />
          <strong>Total Payable:</strong> {user?.total_payable}
          <br />
          <strong>Payment Type:</strong> {user?.payment_type}
          <br />
          <strong>Selected Course:</strong> {user?.selected_course}
        </Box>
      </InfoCard>
    ) : null;

  const ActivityCard = () => (
    <InfoCard title="Activity" isEditing={null}>
      <Box>
        <strong>Created At:</strong> {user?.created_at}
        <br />
        <strong>Updated At:</strong> {user?.updated_at}
      </Box>
    </InfoCard>
  );

  const NataCalculatorCard = () => (
    <InfoCard title="NATA Calculator Sessions" isEditing={null}>
      <Box>
        <strong>Sessions:</strong>{" "}
        {user?.nata_calculator_sessions
          ? JSON.stringify(user.nata_calculator_sessions)
          : "None"}
      </Box>
    </InfoCard>
  );

  const AuthAccountsCard = () => (
    <InfoCard title="Auth Accounts" isEditing={null}>
      <Box>
        <strong>Google Info:</strong>{" "}
        {user?.google_info ? JSON.stringify(user.google_info) : ""}
        <br />
        <strong>Firebase UID:</strong> {user?.firebase_uid}
        <br />
        <strong>Legacy External ID:</strong> {user?.legacy_external_id}
      </Box>
    </InfoCard>
  );

  // Other cards: ContactAddressCard, EducationCard, CourseCard, ActivityCard, NataCalculatorCard, AuthAccountsCard
  // ...implement similarly, passing correct fields and handlers

  if (!open) return null;
  return (
    <BigDrawer
      open={open}
      onClose={onClose}
      title={user?.student_name || "User Details"}
      actions={[
        <Button
          key="save"
          variant="contained"
          color="primary"
          onClick={() => handleSave()}
          disabled={loading}
        >
          Save
        </Button>,
        <Button
          key="cancel"
          variant="outlined"
          color="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>,
        <Button
          key="undo"
          variant="text"
          color="warning"
          onClick={handleUndoAll}
        >
          Undo All
        </Button>,
      ]}
    >
      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ p: 2, overflowY: "auto", maxHeight: "calc(100vh - 64px)" }}>
          {/* Drawer header with delete button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
              <span className="material-icons">delete</span>
            </IconButton>
          </Box>
          {/* Cards */}
          <BasicInfoCard />
          <ContactAddressCard />
          <EducationCard />
          <CourseCard />
          <ActivityCard />
          <NataCalculatorCard />
          <AuthAccountsCard />
        </Box>
      )}
      // Remove any duplicate or misplaced handleUndoAll definitions after the
      return
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
    </BigDrawer>
  );
};

export default WebUsersDrawer;
