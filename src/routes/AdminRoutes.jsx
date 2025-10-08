import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireRole from "../auth/RequireRole";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Enquiries from "../pages/admin/Enquiries";

const AdminRoutes = () => {
  return (
    <RequireRole allowedRoles={["Admin"]}>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          {/* Admin Dashboard - Default route */}
          <Route index element={<Dashboard />} />

          {/* Enquiry Database */}
          <Route path="enquiries" element={<Enquiries />} />

          {/* Redirect unknown admin routes to dashboard */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </RequireRole>
  );
};

export default AdminRoutes;
