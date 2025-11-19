import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireRole from "../auth/RequireRole";
import SharedLayout from "../layouts/SharedLayout";
import StudentDashboard from "../pages/student/Dashboard";
import StudentCourses from "../pages/student/Courses";
import StudentAssignments from "../pages/student/Assignments";
import StudentGrades from "../pages/student/Grades";
import StudentSchedule from "../pages/student/Schedule";
import StudentResources from "../pages/student/Resources";
import StudentSettings from "../pages/student/Settings";

const StudentRoutes = () => {
  return (
    <RequireRole allowedRoles={["Student", "Teacher", "Admin"]}>
      <Routes>
        <Route path="/" element={<SharedLayout userRole="student" />}>
          {/* Student Dashboard - Default route */}
          <Route index element={<StudentDashboard />} />

          {/* Student-specific routes */}
          <Route path="courses" element={<StudentCourses />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="grades" element={<StudentGrades />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="resources" element={<StudentResources />} />
          <Route path="settings" element={<StudentSettings />} />

          {/* Redirect unknown student routes to dashboard */}
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Route>
      </Routes>
    </RequireRole>
  );
};

export default StudentRoutes;
