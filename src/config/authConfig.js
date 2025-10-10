import { LogLevel } from "@azure/msal-browser";

// Build authority from tenant id (tenant-specific endpoint recommended)
const tenantId = process.env.REACT_APP_MSAL_TENANT_ID;
const authority = tenantId
  ? `https://login.microsoftonline.com/${tenantId}`
  : "https://login.microsoftonline.com/common";

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_MSAL_CLIENT_ID || "",
    authority,
    // Use envs; fall back to current origin if envs missing
    redirectUri:
      process.env.REACT_APP_MSAL_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri:
      process.env.REACT_APP_MSAL_POST_LOGOUT_URI || window.location.origin,
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
