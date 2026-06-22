import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | ACK Kabianga Parish",
    default: "ACK Kabianga Parish - Welcome to Our Church Community",
  },
  description: "Welcome to ACK Kabianga Parish, a vibrant Christian community. Join us for Sunday services, prayers, fellowship, and community outreach in Kabianga.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-background text-foreground pb-20 md:pb-0">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-4 md:mb-12">
          {children}
        </main>
        <footer className="w-full border-t border-border bg-card py-6 text-center text-xs text-muted-foreground mt-auto hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <p>&copy; {new Date().getFullYear()} ACK Kabianga Parish. All rights reserved.</p>
            <p className="mt-1">Serving God, Transforming Lives.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

