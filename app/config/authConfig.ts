import { LogLevel, Configuration } from "@azure/msal-browser";

// Build authority from tenant id (tenant-specific endpoint recommended)
const tenantId =
  process.env.NEXT_PUBLIC_MSAL_TENANT_ID ||
  process.env.REACT_APP_MSAL_TENANT_ID;
const authority = tenantId
  ? `https://login.microsoftonline.com/${tenantId}`
  : "https://login.microsoftonline.com/common";

export const msalConfig: Configuration = {
  auth: {
    clientId:
      process.env.NEXT_PUBLIC_MSAL_CLIENT_ID ||
      process.env.REACT_APP_MSAL_CLIENT_ID ||
      "",
    authority,
    // Prefer deriving redirect URIs from the current browser origin so the
    // same build works on localhost, vercel dev and prod without changing env files.
    redirectUri: (() => {
      if (typeof window !== "undefined") {
        return `${window.location.origin}/auth/callback`;
      }
      return (
        process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI ||
        process.env.REACT_APP_MSAL_REDIRECT_URI ||
        ""
      );
    })(),
    postLogoutRedirectUri: (() => {
      if (typeof window !== "undefined") {
        return `${window.location.origin}/auth/logout`;
      }
      return (
        process.env.NEXT_PUBLIC_MSAL_POST_LOGOUT_URI ||
        process.env.REACT_APP_MSAL_POST_LOGOUT_URI ||
        ""
      );
    })(),
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: { logLevel: LogLevel.Error },
  },
};

// Scopes you need
export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

// Microsoft Graph endpoints (unchanged)
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphPhotoEndpoint: "https://graph.microsoft.com/v1.0/me/photo/$value",
};
