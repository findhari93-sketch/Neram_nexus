import Link from "next/link";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const message =
    searchParams?.error || "An unexpected authentication error occurred.";
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Authentication Error</h1>
      <p>{message}</p>
      <p>
        <Link href="/auth/signin">Try signing in again</Link>
      </p>
    </div>
  );
}
