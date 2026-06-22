import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from '@/components/ThemeProvider';
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | Kabianga Parish",
    default: "Kabianga Parish - Welcome to Our Church Community",
  },
  verification: {
    google: "FGFcghGjaq4hXdgLmVup6F6WKz40EieegAoGv-ezzzg",
  },
  description: "Welcome to Kabianga Parish, a vibrant Catholic community under the Kericho Diocese. Join us for Sunday Mass services, confessions, fellowship, and community outreach in Kabianga.",
  keywords: [
    "kabianga",
    "kabianga parish",
    "kericho diocese",
    "kericho dioces",
    "parish kabianga",
    "kabianga church",
    "churches in kericho",
    "chirches in kericho",
    "kiptere deanery church",
    "kiptere dinary church",
    "kiptere deanery",
    "kiptere dinary",
    "kabianga catholic church",
    "catholic church near kabianga university",
    "churches in kiptere",
    "belgut constituency catholic church"
  ],
  alternates: {
    canonical: "https://kabiangaparish.org",
  },
  openGraph: {
    title: "Kabianga Parish - Catholic Diocese of Kericho",
    description: "Welcome to Kabianga Parish, a vibrant Catholic community under the Kericho Diocese. Join us for Sunday Mass, confessions, and community fellowship.",
    url: "https://kabiangaparish.org",
    siteName: "Kabianga Parish",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-background text-foreground pb-20 md:pb-0">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-4 md:mb-12">
            {children}
          </main>
          <footer className="w-full border-t border-border bg-card py-6 text-center text-xs text-muted-foreground mt-auto hidden md:block">
            <div className="max-w-7xl mx-auto px-4">
              <p>&copy; {new Date().getFullYear()} Kabianga Parish. All rights reserved.</p>
              <p className="mt-1 font-semibold">Serving God, Transforming Lives in the Diocese of Kericho.</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
