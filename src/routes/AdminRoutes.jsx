import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireRole from "../auth/RequireRole";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import WebUsers from "../pages/admin/WebUsers";

const AdminRoutes = () => {
  return (
    <RequireRole allowedRoles={["Admin"]}>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          {/* Admin Dashboard - Default route */}
          <Route index element={<Dashboard />} />

          {/* Web Users */}
          <Route path="web-users" element={<WebUsers />} />

          {/* Redirect unknown admin routes to dashboard */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </RequireRole>
  );
};

export default AdminRoutes;
