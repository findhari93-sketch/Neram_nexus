import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import SignInButton from "@/app/components/SignInButton";
import SignOutButton from "@/app/components/SignOutButton";
import { headers } from "next/headers";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const headersList = headers();
  const hostname = headersList.get("host") || "";

  // Domain constants
  const ADMIN_DOMAIN =
    process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "admin.neramclasses.com";
  const APP_DOMAIN =
    process.env.NEXT_PUBLIC_APP_DOMAIN || "app.neramclasses.com";

  // Check if localhost (development) - allow access to all dashboards
  const isLocalhost =
    hostname.includes("localhost") || hostname.includes("127.0.0.1");
  const isAdminDomain =
    isLocalhost || hostname.includes(ADMIN_DOMAIN.split(":")[0]);
  const isAppDomain =
    isLocalhost || hostname.includes(APP_DOMAIN.split(":")[0]);

  return (
    <div>
      <h1>Neram Admin Nexus</h1>
      <p>Administrative management system with Azure AD authentication</p>

      {session ? (
        <div style={{ marginTop: "2rem" }}>
          <p>
            Welcome, <strong>{session.user.name}</strong>!
          </p>
          <p>
            Role: <strong>{session.user.role}</strong>
          </p>

          <nav style={{ marginTop: "1.5rem" }}>
            <h2>Available Dashboards:</h2>
            <ul style={{ marginTop: "1rem" }}>
              {/* Super Admin Dashboard - only on admin domain */}
              {session.user.role === "super_admin" && isAdminDomain && (
                <li>
                  <Link href="/superadmin">Super Admin Dashboard</Link>
                </li>
              )}
              {/* Admin Dashboard - only on admin domain */}
              {["super_admin", "admin"].includes(session.user.role) &&
                isAdminDomain && (
                  <li>
                    <Link href="/admin">Admin Dashboard</Link>
                  </li>
                )}
              {/* Teacher Dashboard - available on both domains */}
              {["super_admin", "admin", "teacher"].includes(
                session.user.role
              ) && (
                <li>
                  <Link href="/teacher">Teacher Dashboard</Link>
                </li>
              )}
              {/* Student Dashboard - available on both domains */}
              <li>
                <Link href="/student">Student Dashboard</Link>
              </li>
            </ul>
          </nav>

          {/* sign out button */}
          <div style={{ marginTop: 16 }}>
            <SignOutButton />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "2rem" }}>
          <p>Please sign in to access the application.</p>
          <div style={{ marginTop: "1rem" }}>
            <SignInButton callbackUrl="/" />
          </div>
        </div>
      )}
    </div>
  );
}
