"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Box, Container, Typography, Button, Alert, Paper } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, { title: string; description: string; solution: string }> = {
  Configuration: {
    title: "Configuration Error",
    description: "There is a problem with the server configuration.",
    solution: "Please contact your administrator to check environment variables (AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID)."
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You do not have permission to sign in.",
    solution: "Please contact your administrator to request access."
  },
  Verification: {
    title: "Verification Error",
    description: "The sign in link is no longer valid.",
    solution: "It may have expired. Please sign in again."
  },
  OAuthSignin: {
    title: "OAuth Sign In Error",
    description: "Error in constructing an authorization URL.",
    solution: "Check that your Azure AD credentials are correctly configured."
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "Error in handling the response from Azure AD.",
    solution: "Verify the redirect URI in Azure AD matches: https://admin.neramclasses.com/api/auth/callback/azure-ad"
  },
  OAuthCreateAccount: {
    title: "Account Creation Error",
    description: "Could not create user account.",
    solution: "Please try again or contact support."
  },
  EmailCreateAccount: {
    title: "Email Account Error",
    description: "Could not create email provider user.",
    solution: "Please try again or contact support."
  },
  Callback: {
    title: "Callback Error",
    description: "Error in the OAuth callback handler.",
    solution: "Check Azure AD redirect URIs and ensure they match your domain. Expected: https://admin.neramclasses.com/api/auth/callback/azure-ad"
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description: "This account is already linked to another user.",
    solution: "Sign in with the original provider used for this email address."
  },
  SessionRequired: {
    title: "Session Required",
    description: "You must be signed in to access this page.",
    solution: "Please sign in first."
  },
  Default: {
    title: "Authentication Error",
    description: "An unexpected error occurred during authentication.",
    solution: "Please try signing in again."
  }
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorType = searchParams?.get("error") || "Default";
  const errorInfo = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.Default;

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 600 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom color="error">
              {errorInfo.title}
            </Typography>
          </Box>

          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1" paragraph>
              <strong>What happened:</strong> {errorInfo.description}
            </Typography>
            <Typography variant="body2">
              <strong>How to fix:</strong> {errorInfo.solution}
            </Typography>
          </Alert>

          {errorType === "Callback" && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" component="div">
                <strong>Callback Error Troubleshooting:</strong>
                <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                  <li>Verify redirect URI in Azure AD: <code>https://admin.neramclasses.com/api/auth/callback/azure-ad</code></li>
                  <li>Check NEXTAUTH_URL environment variable is set to: <code>https://admin.neramclasses.com</code></li>
                  <li>Ensure Azure AD Client ID and Secret are correct</li>
                  <li>Remove any localhost redirect URIs from Azure AD for production</li>
                </ul>
              </Typography>
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
            <Button
              variant="outlined"
              component={Link}
              href="/"
            >
              Go Home
            </Button>
            <Button
              variant="contained"
              component={Link}
              href="/auth/signin"
            >
              Try Again
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Error Code: {errorType}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
