"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface Props {
  callbackUrl?: string;
}

export default function SignInButton({ callbackUrl = "/" }: Props) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          console.log("[SignInButton] Initiating Azure AD sign-in");
          await signIn("azure-ad", { callbackUrl });
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      style={{
        padding: "0.75rem 1.25rem",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      {loading ? "Redirecting..." : "Sign in with Microsoft"}
    </button>
  );
}
