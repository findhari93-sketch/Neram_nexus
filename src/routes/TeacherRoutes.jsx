import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireRole from "../auth/RequireRole";
import SharedLayout from "../layouts/SharedLayout";
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherClasses from "../pages/teacher/Classes";
import TeacherStudents from "../pages/teacher/Students";
import TeacherAssignments from "../pages/teacher/Assignments";
import TeacherGrades from "../pages/teacher/Grades";
import TeacherSchedule from "../pages/teacher/Schedule";
import TeacherSettings from "../pages/teacher/Settings";

const TeacherRoutes = () => {
  return (
    <RequireRole allowedRoles={["Teacher", "Admin"]}>
      <Routes>
        <Route path="/" element={<SharedLayout userRole="teacher" />}>
          {/* Teacher Dashboard - Default route */}
          <Route index element={<TeacherDashboard />} />

          {/* Teacher-specific routes */}
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="grades" element={<TeacherGrades />} />
          <Route path="schedule" element={<TeacherSchedule />} />
          <Route path="settings" element={<TeacherSettings />} />

          {/* Redirect unknown teacher routes to dashboard */}
          <Route path="*" element={<Navigate to="/teacher" replace />} />
        </Route>
      </Routes>
    </RequireRole>
  );
};

export default TeacherRoutes;
