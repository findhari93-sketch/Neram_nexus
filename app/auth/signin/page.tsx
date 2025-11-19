"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Error connecting to the authentication provider. Please try again.",
  OAuthCallback: "Error during authentication callback. Please verify your credentials.",
  OAuthCreateAccount: "Could not create account. Please contact support.",
  EmailCreateAccount: "Could not create account with this email.",
  Callback: "Authentication callback failed. Please check your Azure AD configuration.",
  OAuthAccountNotLinked: "This email is already associated with another account.",
  EmailSignin: "Error sending sign-in email.",
  CredentialsSignin: "Sign in failed. Check your credentials.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An error occurred during sign in. Please try again.",
};

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("azure-ad", { callbackUrl });
    } catch (err) {
      console.error("Sign in error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 500, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Neram Admin Nexus
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              icon={<ErrorOutlineIcon />}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Authentication Failed
              </Typography>
              <Typography variant="body2">
                {ERROR_MESSAGES[error] || ERROR_MESSAGES.Default}
              </Typography>
              {error === "Callback" && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  This usually means there's a configuration issue. Please contact your administrator.
                </Typography>
              )}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
            Sign in using your Microsoft account from Neram Classes
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSignIn}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <MicrosoftIcon />}
            sx={{
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            {loading ? "Connecting..." : "Sign in with Microsoft"}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", mt: 3 }}
          >
            By signing in, you agree to use this application in accordance with your organization's policies.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
