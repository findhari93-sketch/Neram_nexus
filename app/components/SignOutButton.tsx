"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const onClick = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Are you sure you want to sign out?");
      if (!ok) return;
    }
    signOut();
  };

  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.5rem 1rem",
        background: "#334155",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      Sign out
    </button>
  );
}
