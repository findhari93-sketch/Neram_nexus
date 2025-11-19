"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message =
    searchParams.get("message") || "An error occurred while processing your payment.";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 600, width: "100%" }}>
        <CardContent sx={{ textAlign: "center", p: 4 }}>
          <ErrorIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Payment Error
          </Typography>
          <Alert severity="error" sx={{ mt: 2, mb: 3, textAlign: "left" }}>
            {message}
          </Alert>
          <Typography color="text.secondary" paragraph>
            If you continue to experience issues, please contact our support team at{" "}
            <strong>helpdesk@neram.co.in</strong>
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
            <Button variant="outlined" onClick={() => router.push("/")}>
              Go to Home
            </Button>
            <Button variant="contained" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
