import React, { useMemo, useState, useCallback } from "react";
import { Box } from "@mui/material";
import AppAgGrid from "../../components/EnquiryDataGrid/AppAgGrid";
import {
  AddEnquiry,
  EditEnquiry,
} from "../../components/EnquiryDataGrid/Enquiry";

const Enquiries = () => {
  // Editable demo data
  const [rows, setRows] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "+1 (555) 123-4567",
      status: "New",
      course: "Mathematics",
      source: "Website",
      notes: "Interested in advanced calculus",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      phone: "+1 (555) 234-5678",
      status: "Contacted",
      course: "Physics",
      source: "Phone Call",
      notes: "Follow up next week",
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol@example.com",
      phone: "+1 (555) 345-6789",
      status: "Qualified",
      course: "Chemistry",
      source: "Referral",
      notes: "Ready to enroll",
    },
  ]);

  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Open edit drawer with selected enquiry
  const openEditor = useCallback((row) => {
    if (!row) return;
    setSelectedEnquiry(row);
    setEditDrawerOpen(true);
  }, []);

  // Handle adding new enquiry
  const handleAddEnquiry = useCallback((newEnquiry) => {
    setRows((prev) => [...prev, newEnquiry]);
  }, []);

  // Handle updating existing enquiry
  const handleUpdateEnquiry = useCallback((updatedEnquiry) => {
    setRows((prev) =>
      prev.map((r) => (r.id === updatedEnquiry.id ? updatedEnquiry : r))
    );
  }, []);

  const columnDefs = useMemo(
    () => [
      { headerName: "Name", field: "name", minWidth: 180 },
      { headerName: "Email", field: "email", minWidth: 220 },
      {
        headerName: "Status",
        field: "status",
        minWidth: 140,
        filter: "agSetColumnFilter",
      },
    ],
    []
  );

  return (
    <Box>
      {/* Action bar now handled internally by AppAgGrid */}
      <AppAgGrid
        rowData={rows}
        columnDefs={columnDefs}
        pagination
        pageSize={10}
        enableSelection
        quickFilter
        showColumnFilters
        height={520}
        onRowClick={openEditor}
        title="Enquiries"
        breadcrumbs={[{ label: "Home" }, { label: "Enquiries", active: true }]}
        onBack={() => window.history.back()}
        showDateFilter
        onAddClick={() => setAddDrawerOpen(true)}
        onExportClick={() => {
          /* could pass custom export logic */
        }}
      />

      {/* Add Enquiry Drawer */}
      <AddEnquiry
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        onSave={handleAddEnquiry}
      />

      {/* Edit Enquiry Drawer */}
      <EditEnquiry
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        onSave={handleUpdateEnquiry}
        enquiryData={selectedEnquiry}
      />
    </Box>
  );
};

export default Enquiries;
