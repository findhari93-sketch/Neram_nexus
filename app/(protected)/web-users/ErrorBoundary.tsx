"use client";
import React from "react";
import {
  Box,
  Button,
  Alert,
  AlertTitle,
  Collapse,
  Typography,
} from "@mui/material";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
  showDetails: boolean;
  resetKey: number;
};

/**
 * ErrorBoundary — graceful React error boundary for client components.
 * Shows an Alert with a Retry button and toggleable details.
 * Use by wrapping a tree: <ErrorBoundary><MyComponent /></ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      resetKey: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // you can log the error to an error reporting service here
    // e.g. window.__SENTRY__?.captureException(error, { extra: errorInfo })
    this.setState({ error, errorInfo });
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    // Reset the boundary state so children re-mount.
    this.setState((s) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      resetKey: s.resetKey + 1,
    }));
  };

  toggleDetails = () => {
    this.setState((s) => ({ showDetails: !s.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }} role="alert">
          <Alert
            severity="error"
            action={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button color="inherit" size="small" onClick={this.handleRetry}>
                  Retry
                </Button>
                <Button
                  color="inherit"
                  size="small"
                  onClick={this.toggleDetails}
                >
                  {this.state.showDetails ? "Hide details" : "Show details"}
                </Button>
              </Box>
            }
          >
            <AlertTitle>Something went wrong</AlertTitle>
            <Typography variant="body2">
              An unexpected error occurred while rendering this section.
            </Typography>
          </Alert>

          <Collapse in={this.state.showDetails} sx={{ mt: 2 }}>
            <Box
              sx={{
                bgcolor: "background.paper",
                p: 1,
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <Typography variant="subtitle2">Error</Typography>
              <Typography
                component="pre"
                sx={{ whiteSpace: "pre-wrap", fontSize: 12 }}
              >
                {String(this.state.error?.message ?? "")}
              </Typography>
              {this.state.errorInfo?.componentStack ? (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Stack
                  </Typography>
                  <Typography
                    component="pre"
                    sx={{ whiteSpace: "pre-wrap", fontSize: 11 }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </>
              ) : null}
            </Box>
          </Collapse>
        </Box>
      );
    }

    // Key ensures a fresh mount after reset.
    return (
      <React.Fragment key={this.state.resetKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
