import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b shrink-0">
        <nav className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          <Link href="/dashboard" className="font-semibold text-base sm:text-lg">
            Moodify
          </Link>
          <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">
            Profile
          </Link>
        </nav>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}