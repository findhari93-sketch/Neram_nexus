import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <p>
        <Link href="/">Return to home</Link>
      </p>
    </div>
  );
}
