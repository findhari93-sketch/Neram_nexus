import React from "react";
import { Alert, Button } from "@mui/material";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  showDetails: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, showDetails: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          severity="error"
          action={
            <>
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  this.setState({
                    showDetails: !this.state.showDetails,
                  })
                }
              >
                {this.state.showDetails ? "Hide" : "Show"} Details
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  this.setState({ hasError: false, error: undefined })
                }
              >
                Retry
              </Button>
            </>
          }
        >
          Something went wrong rendering the class requests grid.
          {this.state.showDetails && this.state.error && (
            <pre style={{ marginTop: 8, fontSize: 12 }}>
              {this.state.error.message}
            </pre>
          )}
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
