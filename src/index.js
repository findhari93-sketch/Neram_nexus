import React from "react";
import ReactDOM from "react-dom/client";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { BrowserRouter } from "react-router-dom";
import { msalConfig } from "./config/authConfig";
import "./index.css";
import App from "./App";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LocalizationProvider>
    </MsalProvider>
  </React.StrictMode>
);
