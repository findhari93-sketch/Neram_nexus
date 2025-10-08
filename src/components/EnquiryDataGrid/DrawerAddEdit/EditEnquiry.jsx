import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
} from "@mui/material";
import BigDrawer from "../../Shared/BigDrawer";

/**
 * EditEnquiry Component
 * Form for editing an existing enquiry using BigDrawer
 *
 * Props:
 *  - open: boolean - Controls drawer visibility
 *  - onClose: function - Called when drawer is closed
 *  - onSave: function(enquiryData) - Called when form is submitted
 *  - enquiryData: object - The enquiry data to edit
 */
const EditEnquiry = ({ open, onClose, onSave, enquiryData }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "New",
    course: "",
    source: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Update form when enquiryData changes
  useEffect(() => {
    if (enquiryData) {
      setFormData({
        name: enquiryData.name || "",
        email: enquiryData.email || "",
        phone: enquiryData.phone || "",
        status: enquiryData.status || "New",
        course: enquiryData.course || "",
        source: enquiryData.source || "",
        notes: enquiryData.notes || "",
      });
    }
  }, [enquiryData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.course.trim()) {
      newErrors.course = "Course is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...enquiryData,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const drawerActions = [
    <Button key="cancel" variant="outlined" onClick={handleClose}>
      Cancel
    </Button>,
    <Button key="save" variant="contained" color="primary" onClick={handleSave}>
      Update Enquiry
    </Button>,
  ];

  return (
    <BigDrawer
      open={open}
      onClose={handleClose}
      title="Edit Enquiry"
      actions={drawerActions}
    >
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Personal Information Section */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                placeholder="Enter full name"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              required
              placeholder="email@example.com"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              required
              placeholder="+1 (555) 000-0000"
            />
          </Grid>

          {/* Enquiry Details Section */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Course Interested"
              name="course"
              value={formData.course}
              onChange={handleChange}
              error={!!errors.course}
              helperText={errors.course}
              required
              placeholder="e.g., Mathematics, Science"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Contacted">Contacted</MenuItem>
                <MenuItem value="Qualified">Qualified</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                name="source"
                value={formData.source}
                onChange={handleChange}
                label="Source"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Website">Website</MenuItem>
                <MenuItem value="Phone Call">Phone Call</MenuItem>
                <MenuItem value="Email">Email</MenuItem>
                <MenuItem value="Walk-in">Walk-in</MenuItem>
                <MenuItem value="Referral">Referral</MenuItem>
                <MenuItem value="Social Media">Social Media</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Notes Section */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={4}
              placeholder="Add any additional notes or comments..."
            />
          </Grid>
        </Grid>
      </Box>
    </BigDrawer>
  );
};

export default EditEnquiry;
