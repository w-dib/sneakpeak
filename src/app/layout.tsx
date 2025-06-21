import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { UserAvatar } from "@/components/user-avatar";
import Image from "next/image";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sneakpeak",
  description: "Track competitor websites with ease.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <div className="flex flex-col h-full">
          {user && (
            <header className="flex items-center justify-between h-16 px-4 border-b shrink-0 md:px-6">
              <Image
                src="/logo.svg"
                alt="Sneakpeak logo"
                width={120}
                height={32}
              />
              <UserAvatar user={user} />
            </header>
          )}
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
