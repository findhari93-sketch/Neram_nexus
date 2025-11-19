import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import SignInButton from "@/app/components/SignInButton";
import SignOutButton from "@/app/components/SignOutButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

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
              {session.user.role === "superadmin" && (
                <li>
                  <Link href="/superadmin">Super Admin Dashboard</Link>
                </li>
              )}
              {["superadmin", "admin"].includes(session.user.role) && (
                <li>
                  <Link href="/admin">Admin Dashboard</Link>
                </li>
              )}
              {["superadmin", "admin", "teacher"].includes(
                session.user.role
              ) && (
                <li>
                  <Link href="/teacher">Teacher Dashboard</Link>
                </li>
              )}
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
