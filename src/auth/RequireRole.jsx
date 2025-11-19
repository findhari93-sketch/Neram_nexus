import React from "react";
import { useMsal, useAccount } from "@azure/msal-react";
import { Box, Typography, Paper } from "@mui/material";
import { Lock } from "@mui/icons-material";

const RequireRole = ({ children, allowedRoles = [] }) => {
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  if (!account) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "grey.50",
        }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            maxWidth: 400,
            borderRadius: 2,
          }}
        >
          <Lock sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please sign in to access this area.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const userRoles = account?.idTokenClaims?.roles || [];
  const hasRequiredRole = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasRequiredRole) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "grey.50",
        }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            maxWidth: 400,
            borderRadius: 2,
          }}
        >
          <Lock sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error.main">
            403 - Forbidden
          </Typography>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You don't have permission to access this area.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Required role: {allowedRoles.join(" or ")}
            <br />
            Your roles:{" "}
            {userRoles.length > 0 ? userRoles.join(", ") : "None assigned"}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return children;
};

export default RequireRole;
