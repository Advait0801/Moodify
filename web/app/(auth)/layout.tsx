export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-sm sm:max-w-md">
        {children}
      </div>
    </div>
  );
}