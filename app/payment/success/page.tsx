"use client";

import { useSearchParams, useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const alreadyPaid = searchParams.get("already_paid") === "true";

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
          <CheckCircleIcon
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {alreadyPaid ? "Payment Already Completed" : "Payment Successful!"}
          </Typography>
          <Alert severity="success" sx={{ mt: 2, mb: 3, textAlign: "left" }}>
            {alreadyPaid
              ? "Your payment has already been processed. No further action is required."
              : "Your payment has been received successfully! You will receive a confirmation email shortly."}
          </Alert>
          <Typography color="text.secondary" paragraph>
            Thank you for your payment. Your enrollment is now complete.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/")}
            sx={{ mt: 2 }}
          >
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
