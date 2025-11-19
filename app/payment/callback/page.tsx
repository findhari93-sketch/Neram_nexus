"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Get payment status from URL params
    const paymentId = searchParams.get("razorpay_payment_id");
    const paymentLinkId = searchParams.get("razorpay_payment_link_id");
    const paymentLinkStatus = searchParams.get(
      "razorpay_payment_link_status"
    );

    if (paymentLinkStatus === "paid") {
      setStatus("success");
      setMessage(
        "Your payment has been received successfully! You will receive a confirmation email shortly."
      );
    } else if (paymentId) {
      // Payment was initiated but we need to verify status
      setStatus("success");
      setMessage(
        "Your payment is being processed. You will receive a confirmation email once it's verified."
      );
    } else {
      setStatus("error");
      setMessage(
        "Payment was not completed. Please try again or contact support."
      );
    }
  }, [searchParams]);

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
          {status === "loading" && (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Processing Payment...
              </Typography>
              <Typography color="text.secondary">
                Please wait while we verify your payment
              </Typography>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircleIcon
                sx={{ fontSize: 80, color: "success.main", mb: 2 }}
              />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Payment Successful!
              </Typography>
              <Alert severity="success" sx={{ mt: 2, mb: 3, textAlign: "left" }}>
                {message}
              </Alert>
              <Typography color="text.secondary" paragraph>
                Payment ID:{" "}
                {searchParams.get("razorpay_payment_id") || "Processing..."}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/")}
                sx={{ mt: 2 }}
              >
                Go to Home
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <ErrorIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Payment Failed
              </Typography>
              <Alert severity="error" sx={{ mt: 2, mb: 3, textAlign: "left" }}>
                {message}
              </Alert>
              <Typography color="text.secondary" paragraph>
                If you have any questions, please contact our support team at{" "}
                <strong>helpdesk@neram.co.in</strong>
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/")}
                >
                  Go to Home
                </Button>
                <Button
                  variant="contained"
                  onClick={() => window.history.back()}
                >
                  Try Again
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
