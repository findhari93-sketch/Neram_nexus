import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Add } from "@mui/icons-material";

const DataGridDemo = () => {
  const [rowData, setRowData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // Sample data
  useEffect(() => {
    const sampleData = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "Admin",
        status: "Active",
        joinDate: "2023-01-15",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "User",
        status: "Active",
        joinDate: "2023-02-20",
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike@example.com",
        role: "Editor",
        status: "Inactive",
        joinDate: "2023-03-10",
      },
      {
        id: 4,
        name: "Sarah Wilson",
        email: "sarah@example.com",
        role: "User",
        status: "Active",
        joinDate: "2023-04-05",
      },
      {
        id: 5,
        name: "David Brown",
        email: "david@example.com",
        role: "Admin",
        status: "Active",
        joinDate: "2023-05-12",
      },
    ];
    setRowData(sampleData);
  }, []);

  const columnDefs = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
      sortable: true,
      filter: true,
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      sortable: true,
      filter: true,
    },
    {
      field: "role",
      headerName: "Role",
      width: 100,
      sortable: true,
      filter: true,
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const color = params.value === "Active" ? "#4caf50" : "#f44336";
        return `<span style="color: ${color}; font-weight: bold;">${params.value}</span>`;
      },
    },
    {
      field: "joinDate",
      headerName: "Join Date",
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      width: 120,
      cellRenderer: (params) => {
        return `
          <div style="display: flex; gap: 8px; align-items: center; height: 100%;">
            <button class="edit-btn" data-id="${params.data.id}" style="border: none; background: #1976d2; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Edit</button>
            <button class="delete-btn" data-id="${params.data.id}" style="border: none; background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Del</button>
          </div>
        `;
      },
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  const handleCellClicked = (event) => {
    if (event.event.target.classList.contains("edit-btn")) {
      const id = parseInt(event.event.target.getAttribute("data-id"));
      const row = rowData.find((r) => r.id === id);
      setEditingRow(row);
      setOpen(true);
    } else if (event.event.target.classList.contains("delete-btn")) {
      const id = parseInt(event.event.target.getAttribute("data-id"));
      setRowData((prev) => prev.filter((row) => row.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingRow({
      id: Math.max(...rowData.map((r) => r.id)) + 1,
      name: "",
      email: "",
      role: "User",
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (editingRow) {
      const existingIndex = rowData.findIndex((r) => r.id === editingRow.id);
      if (existingIndex >= 0) {
        // Update existing
        setRowData((prev) =>
          prev.map((row) => (row.id === editingRow.id ? editingRow : row))
        );
      } else {
        // Add new
        setRowData((prev) => [...prev, editingRow]);
      }
    }
    setOpen(false);
    setEditingRow(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRow(null);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          User Management Grid
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddNew}>
          Add User
        </Button>
      </Box>

      <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          onCellClicked={handleCellClicked}
          animateRows={true}
        />
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRow && rowData.find((r) => r.id === editingRow.id)
            ? "Edit User"
            : "Add New User"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={editingRow?.name || ""}
              onChange={(e) =>
                setEditingRow((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editingRow?.email || ""}
              onChange={(e) =>
                setEditingRow((prev) => ({ ...prev, email: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Role"
              select
              SelectProps={{ native: true }}
              value={editingRow?.role || "User"}
              onChange={(e) =>
                setEditingRow((prev) => ({ ...prev, role: e.target.value }))
              }
              fullWidth
            >
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="User">User</option>
            </TextField>
            <TextField
              label="Status"
              select
              SelectProps={{ native: true }}
              value={editingRow?.status || "Active"}
              onChange={(e) =>
                setEditingRow((prev) => ({ ...prev, status: e.target.value }))
              }
              fullWidth
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DataGridDemo;
