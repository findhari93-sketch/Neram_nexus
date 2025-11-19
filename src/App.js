import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useIsAuthenticated, useAccount, useMsal } from "@azure/msal-react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";

// Theme
import theme from "./theme";

// Components
import LoginPage from "./components/LoginPage";
import AdminRoutes from "./routes/AdminRoutes";
import TeacherRoutes from "./routes/TeacherRoutes";
import StudentRoutes from "./routes/StudentRoutes";

function App() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  // Get user's primary role for default routing
  const getUserRole = () => {
    if (!account?.idTokenClaims?.roles) return "student";
    const roles = account.idTokenClaims.roles;

    // Priority order: Admin > Teacher > Student
    if (roles.includes("Admin")) return "admin";
    if (roles.includes("Teacher")) return "teacher";
    if (roles.includes("Student")) return "student";

    return "student"; // Default fallback
  };

  const getDefaultRoute = () => {
    const role = getUserRole();
    switch (role) {
      case "Admin":
        return "/admin";
      case "Teacher":
        return "/teacher";
      case "Student":
        return "/student";
      default:
        return "/admin"; // Default to admin if no role is found
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", backgroundColor: "grey.50" }}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={getDefaultRoute()} replace />
              ) : (
                <LoginPage />
              )
            }
          />

          {/* Role-based Routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/teacher/*" element={<TeacherRoutes />} />
          <Route path="/student/*" element={<StudentRoutes />} />

          {/* Default Redirects */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={getDefaultRoute()} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to={getDefaultRoute()} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}

export default App;
