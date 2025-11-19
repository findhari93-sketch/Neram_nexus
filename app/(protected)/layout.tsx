import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TopNavHeader from "@/app/components/TopNavBar/TopNavBar";
import ClientProtectedShell from "@/app/components/ProtectedShell/ClientProtectedShell";
import React from "react";
// Server component (fetches session); client interactivity handled in nested client shell.

export const metadata = {
  title: "Neram Admin Nexus",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <ClientProtectedShell role={session.user.role}>
      {children}
    </ClientProtectedShell>
  );
}
