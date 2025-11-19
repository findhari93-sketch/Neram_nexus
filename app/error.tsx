"use client";

import { useEffect } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          gap: 3,
        }}
      >
        <ErrorIcon sx={{ fontSize: 80, color: "error.main" }} />
        <Typography variant="h2" component="h1" gutterBottom>
          Something went wrong!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          An unexpected error occurred. Please try again.
        </Typography>
        {error.message && (
          <Typography
            variant="body2"
            color="error"
            sx={{
              fontFamily: "monospace",
              bgcolor: "grey.100",
              p: 2,
              borderRadius: 1,
              maxWidth: "100%",
              overflow: "auto",
            }}
          >
            {error.message}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={() => window.location.href = "/"}>
            Go Home
          </Button>
          <Button variant="contained" onClick={reset}>
            Try Again
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
