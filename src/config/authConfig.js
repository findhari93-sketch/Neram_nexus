// MSAL configuration
export const msalConfig = {
  auth: {
    clientId: "aa039c70-50d2-4c91-bd0e-5675df5e50ff", // Your Azure AD App Registration Client ID
    authority:
      "https://login.microsoftonline.com/34f1037a-2491-4c77-a011-f0c12e275c57", // Your Tenant ID
    redirectUri: "http://localhost:3000", // Must match the redirect URI configured in Azure AD
    postLogoutRedirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ["User.Read", "openid", "profile"],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphPhotoEndpoint: "https://graph.microsoft.com/v1.0/me/photo/$value",
};
