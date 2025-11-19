import { NextResponse } from "next/server";

// Debug endpoint to check environment variables (only for troubleshooting)
export async function GET() {
  const env = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
    APP_BASE_URL: process.env.APP_BASE_URL || "NOT SET",
    AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID ? "SET" : "NOT SET",
    AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID
      ? `${process.env.AZURE_AD_CLIENT_ID?.substring(0, 8)}...`
      : "NOT SET",
    AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET
      ? "SET (hidden)"
      : "NOT SET",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET (hidden)" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV || "NOT SET",
  };

  return NextResponse.json({
    message: "NextAuth Environment Configuration",
    environment: env,
    timestamp: new Date().toISOString(),
    warning: "DELETE THIS ENDPOINT AFTER DEBUGGING!",
  });
}
