/**
 * Production-safe logger that strips console statements in production builds
 * Replaces scattered console.log calls throughout the application
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Debug-level logging (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`🔍 [DEBUG] ${message}`, context ?? "");
    }
  }

  /**
   * Info-level logging (only in development)
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`ℹ️ [INFO] ${message}`, context ?? "");
    }
  }

  /**
   * Warning-level logging (development + production)
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`⚠️ [WARN] ${message}`, context ?? "");

    // TODO: Send to error tracking in production
    // if (!this.isDevelopment) {
    //   Sentry.captureMessage(message, { level: 'warning', extra: context });
    // }
  }

  /**
   * Error-level logging (development + production)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(`❌ [ERROR] ${message}`, error ?? "", context ?? "");

    // TODO: Send to error tracking in production
    // if (!this.isDevelopment) {
    //   Sentry.captureException(error, { extra: { message, ...context } });
    // }
  }

  /**
   * Avatar image logging (development only)
   */
  avatarReceived(
    name: string | null | undefined,
    src: string,
    srcLength?: number
  ): void {
    if (this.isDevelopment) {
      console.log("🖼️ Avatar component received:", {
        name,
        src,
        srcLength: srcLength ?? src?.length,
      });
    }
  }

  /**
   * Avatar load success (development only)
   */
  avatarLoaded(name: string | null | undefined): void {
    if (this.isDevelopment) {
      console.log("✅ Avatar loaded successfully:", name);
    }
  }

  /**
   * Avatar load failure (development only)
   */
  avatarFailed(
    name: string | null | undefined,
    src: string,
    error?: unknown
  ): void {
    if (this.isDevelopment) {
      console.warn("❌ Avatar failed to load:", {
        name,
        src,
        error,
      });
    }
  }

  /**
   * Photo resolution logging (development only)
   */
  photoResolved(
    userId: string | number | undefined,
    photoData: LogContext
  ): void {
    if (this.isDevelopment) {
      console.log("Resolving photo for user:", {
        id: userId,
        ...photoData,
      });
    }
  }

  /**
   * Normalization error logging
   */
  normalizationError(message: string, context: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[Normalization Error] ${message}:`, context);
    }

    // TODO: Send to error tracking in production
    // if (!this.isDevelopment) {
    //   Sentry.captureMessage(`Normalization: ${message}`, {
    //     level: 'warning',
    //     extra: context
    //   });
    // }
  }

  /**
   * Validation error logging
   */
  validationError(rowIndex: number, context: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`Row ${rowIndex} validation failed:`, context);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Type-safe logger interface for external use
export type { LogLevel, LogContext };
