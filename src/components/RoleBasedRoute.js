import React from "react";
import { useAccount, useMsal } from "@azure/msal-react";
import { Navigate } from "react-router-dom";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = account?.idTokenClaims?.roles || [];
  const hasAllowedRole = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasAllowedRole) {
    // Redirect to a default dashboard based on their actual role
    const userRole = userRoles.length > 0 ? userRoles[0] : "Student";
    return <Navigate to={`/dashboard/${userRole.toLowerCase()}`} replace />;
  }

  return children;
};

export default RoleBasedRoute;
