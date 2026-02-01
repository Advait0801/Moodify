import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-[2rem] sm:text-[2.25rem] md:text-[2.5rem] font-bold text-foreground">
        Dashboard
      </h1>
      <p className="mt-2 sm:mt-3 text-muted text-sm sm:text-base font-normal">
        Your mood analysis hub. Start by analyzing your mood.
      </p>
      <Link
        href="/analyze"
        className="mt-4 sm:mt-6 inline-flex items-center justify-center min-h-[48px] px-4 py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-sm sm:text-base font-medium transition-opacity"
      >
        Analyze Mood
      </Link>
    </div>
  );
}