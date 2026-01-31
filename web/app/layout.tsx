import type { Metadata } from "next";
import "./globals.css";
import { AuthProviderWrapper } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Moodify",
  description: "Mood-based music recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground">
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}