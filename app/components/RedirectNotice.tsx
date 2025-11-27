"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Collapse, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * RedirectNotice
 * Displays a dismissible banner when redirected=admin-denied is present in the URL.
 * Triggered for teacher/student roles attempting to access the admin domain.
 */
export default function RedirectNotice() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const redirectedFlag = searchParams.get("redirected");

  useEffect(() => {
    if (redirectedFlag === "admin-denied" || redirectedFlag === "wrong-domain") {
      setOpen(true);
    }
  }, [redirectedFlag]);

  const handleClose = () => {
    setOpen(false);
    // Reconstruct URL without the redirected param
    const params = new URLSearchParams(searchParams.toString());
    params.delete("redirected");
    const query = params.toString();
    const newUrl = query ? `${pathname}?${query}` : pathname;
    // Replace state so back button does not re-show banner
    router.replace(newUrl);
  };

  if (!open) return null;

  // Different messages based on redirect reason
  const getMessage = () => {
    if (redirectedFlag === "admin-denied") {
      return "You tried to access the admin portal. That area is restricted to administrators. You were redirected to the main application.";
    }
    if (redirectedFlag === "wrong-domain") {
      return "Student and Teacher dashboards are only available on the student/teacher portal. You were redirected to the appropriate domain.";
    }
    return "You were redirected.";
  };

  return (
    <Box
      sx={{ position: "fixed", top: 8, left: 0, right: 0, zIndex: 2000, px: 2 }}
    >
      <Collapse in={open}>
        <Alert
          severity="info"
          variant="filled"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ boxShadow: 2 }}
        >
          {getMessage()}
        </Alert>
      </Collapse>
    </Box>
  );
}
