"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PersonIcon from "@mui/icons-material/Person";

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const [apiTest, setApiTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exam-centers?page=1&limit=5");
      const data = await res.json();
      setApiTest({
        status: res.status,
        statusText: res.statusText,
        data: data,
      });
    } catch (error) {
      setApiTest({
        status: "Error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
    setLoading(false);
  };

  const userRoles = (session?.user as any)?.roles || [];
  const hasAdminRole =
    userRoles.includes("admin") || userRoles.includes("super_admin");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", p: 4 }}>
      <Box sx={{ maxWidth: "lg", mx: "auto" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Authentication Debug Page
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Use this page to check your authentication status and roles
        </Typography>

        {/* Session Status */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6">Session Status</Typography>
              {status === "authenticated" ? (
                <Chip label="Authenticated" color="success" size="small" />
              ) : (
                <Chip label={status} color="warning" size="small" />
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {status === "loading" && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={20} />
                <Typography>Loading session...</Typography>
              </Box>
            )}

            {status === "unauthenticated" && (
              <Alert severity="warning">
                You are not signed in. Please sign in to test the API.
              </Alert>
            )}

            {status === "authenticated" && session?.user && (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {(session.user as any).email || "N/A"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {(session.user as any).name || "N/A"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                  >
                    {(session.user as any).id || "N/A"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Roles
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {userRoles.length > 0 ? (
                      userRoles.map((role: string) => (
                        <Chip
                          key={role}
                          label={role}
                          color={
                            role === "admin" || role === "super_admin"
                              ? "success"
                              : "default"
                          }
                          size="small"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="error">
                        No roles assigned
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Admin Access
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {hasAdminRole ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="You have admin access"
                        color="success"
                      />
                    ) : (
                      <Chip
                        icon={<ErrorIcon />}
                        label="No admin access - Need 'admin' or 'super_admin' role"
                        color="error"
                      />
                    )}
                  </Box>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* API Test */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API Connection Test
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test if you can access the Exam Centers API
            </Typography>

            <Button
              variant="contained"
              onClick={testAPI}
              disabled={loading || status !== "authenticated"}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {loading ? "Testing..." : "Test API Access"}
            </Button>

            {apiTest && (
              <Box sx={{ mt: 3 }}>
                <Alert
                  severity={
                    apiTest.status === 200
                      ? "success"
                      : apiTest.status === 403
                      ? "error"
                      : "warning"
                  }
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Status: {apiTest.status} {apiTest.statusText}
                  </Typography>
                  {apiTest.data?.error && (
                    <Typography variant="body2">
                      {apiTest.data.error}
                    </Typography>
                  )}
                  {apiTest.data?.message && (
                    <Typography variant="body2">
                      {apiTest.data.message}
                    </Typography>
                  )}
                </Alert>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.900",
                    borderRadius: 1,
                    overflow: "auto",
                  }}
                >
                  <pre style={{ color: "#00ff00", fontSize: "0.85rem", margin: 0 }}>
                    {JSON.stringify(apiTest, null, 2)}
                  </pre>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        {status === "authenticated" && !hasAdminRole && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              How to fix: Assign Admin Role
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              1. Go to your Supabase Dashboard → SQL Editor
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              2. Run this SQL query (replace with your email):
            </Typography>
            <Box
              sx={{
                p: 1.5,
                bgcolor: "grey.900",
                borderRadius: 1,
                mt: 1,
                mb: 1,
              }}
            >
              <pre style={{ color: "#00ff00", fontSize: "0.75rem", margin: 0 }}>
                {`UPDATE auth.users\nSET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb\nWHERE email = '${
                  (session?.user as any)?.email || "your-email@example.com"
                }';`}
              </pre>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              3. Sign out and sign in again
            </Typography>
            <Typography variant="body2">
              4. Refresh this page to verify
            </Typography>
          </Alert>
        )}
      </Box>
    </Box>
  );
}
