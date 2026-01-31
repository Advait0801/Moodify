import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
        Moodify
      </h1>
      <p className="text-muted-foreground text-center text-sm sm:text-base md:text-lg max-w-xs sm:max-w-md md:max-w-lg">
        Get music recommendations based on your mood. Upload a photo or describe how you feel.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
        <Link
          href="/login"
          className="px-4 py-2.5 sm:py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-center text-sm sm:text-base font-medium transition-colors"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-4 py-2.5 sm:py-3 rounded-md border border-input hover:bg-accent text-center text-sm sm:text-base font-medium transition-colors"
        >
          Register
        </Link>
      </div>
    </main>
  );
}