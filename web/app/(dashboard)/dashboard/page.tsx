import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
        Dashboard
      </h1>
      <p className="mt-2 sm:mt-3 text-muted-foreground text-sm sm:text-base">
        Your mood analysis hub. Start by analyzing your mood.
      </p>
      <Link
        href="/analyze"
        className="mt-4 sm:mt-6 inline-block px-4 py-2.5 sm:py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base font-medium transition-colors"
      >
        Analyze Mood
      </Link>
    </div>
  );
}