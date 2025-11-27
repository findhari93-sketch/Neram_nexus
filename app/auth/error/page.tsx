"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

export const dynamic = "force-dynamic";

const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "admin.example.com";
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "app.example.com";

const ERROR_MESSAGES: Record<
  string,
  { title: string; description: string; solution: string }
> = {
  Configuration: {
    title: "Configuration Error",
    description: "There is a problem with the server configuration.",
    solution:
      "Contact your administrator to verify environment variables (AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID, NEXTAUTH_URL).",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You do not have permission to sign in on this domain.",
    solution: `If you are a teacher or student, use https://${appDomain}. Otherwise request admin access.`,
  },
  Verification: {
    title: "Verification Error",
    description: "The sign in link is no longer valid.",
    solution: "It may have expired. Please sign in again.",
  },
  OAuthSignin: {
    title: "OAuth Sign In Error",
    description: "Error constructing the authorization URL.",
    solution: "Check Azure AD app registration values (Client ID / Tenant ID).",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "Error handling the response from Azure AD.",
    solution: `Verify the redirect URI in Azure AD exactly matches: https://${adminDomain}/api/auth/callback/azure-ad`,
  },
  OAuthCreateAccount: {
    title: "Account Creation Error",
    description: "Could not create user account.",
    solution: "Please try again or contact support.",
  },
  EmailCreateAccount: {
    title: "Email Account Error",
    description: "Could not create email provider user.",
    solution: "Please try again or contact support.",
  },
  Callback: {
    title: "Callback Error",
    description: "Error in the OAuth callback handler.",
    solution: `Check Azure AD redirect URIs and ensure they match your production domain: https://${adminDomain}/api/auth/callback/azure-ad`,
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description: "This account is already linked to another user.",
    solution: "Sign in with the original provider used for this email address.",
  },
  SessionRequired: {
    title: "Session Required",
    description: "You must be signed in to access this page.",
    solution: "Please sign in first.",
  },
  Default: {
    title: "Authentication Error",
    description: "An unexpected error occurred during authentication.",
    solution: "Please try signing in again.",
  },
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
                  <li>
                    Verify redirect URI in Azure AD:{" "}
                    <code>
                      https://{adminDomain}/api/auth/callback/azure-ad
                    </code>
                  </li>
                  <li>
                    Check NEXTAUTH_URL env var is:{" "}
                    <code>https://{adminDomain}</code>
                  </li>
                  <li>Ensure Azure AD Client ID and Secret are correct</li>
                  <li>
                    Remove any localhost redirect URIs from Azure AD for
                    production
                  </li>
                  <li>
                    If signing in from the app portal (<code>{appDomain}</code>)
                    and redirected, re-initiate sign in here.
                  </li>
                </ul>
              </Typography>
            </Alert>
          )}
          {errorType === "AccessDenied" && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" component="div">
                <strong>Role Guidance:</strong> Admin portal (
                <code>{adminDomain}</code>) is restricted to admin and super
                admin roles. Teachers & students should access the learning
                portal at <code>https://{appDomain}</code>.
              </Typography>
            </Alert>
          )}

          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}
          >
            <Button variant="outlined" component={Link} href="/">
              Go Home
            </Button>
            <Button variant="contained" component={Link} href="/auth/signin">
              Try Again
            </Button>
            {errorType === "AccessDenied" && (
              <Button
                variant="outlined"
                component={Link}
                href={`https://${appDomain}`}
              >
                Go to App Portal
              </Button>
            )}
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
