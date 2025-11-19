import SignInButton from "@/app/components/SignInButton";

export default function SignInPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Sign in</h1>
      <p>Please sign in using your Microsoft account from your organization.</p>
      <div style={{ marginTop: "1rem" }}>
        <SignInButton callbackUrl="/" />
      </div>
    </div>
  );
}
