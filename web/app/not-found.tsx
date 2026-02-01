import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 sm:p-6 bg-background">
      <h1 className="text-4xl sm:text-5xl font-bold text-foreground">404</h1>
      <p className="text-muted text-center text-sm sm:text-base max-w-md">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="px-4 py-2.5 sm:py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm sm:text-base"
      >
        Go home
      </Link>
    </div>
  );
}