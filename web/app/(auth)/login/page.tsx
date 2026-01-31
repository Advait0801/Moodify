import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Login</h2>
      <p className="text-sm text-muted">Form coming in Step 3.</p>
      <Link href="/" className="text-sm text-secondary hover:opacity-80 transition-opacity">
        ← Back
      </Link>
    </div>
  );
}