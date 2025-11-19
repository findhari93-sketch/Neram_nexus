import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { Login, School, AdminPanelSettings } from "@mui/icons-material";

const LoginPage = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.error("Login failed:", e);
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <AdminPanelSettings
          sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
        />
        <Typography variant="h3" component="h1" gutterBottom>
          Neram Admin Portal
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Educational Management System
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Sign in to continue
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Use your Microsoft account to access the admin portal
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<Login />}
          onClick={handleLogin}
          sx={{ minWidth: 200, py: 1.5 }}
        >
          Sign in with Microsoft
        </Button>
      </Paper>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <AdminPanelSettings color="error" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Admin Access
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Full system management and user administration
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <School color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Teacher Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage classes, assignments, and student progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <School color="success" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Student Access
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View assignments, grades, and course materials
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
