import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from '@/components/ThemeProvider';
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | Kabianga Catholic Parish",
    default: "Kabianga Catholic Parish",
  },
  verification: {
    google: "FGFcghGjaq4hXdgLmVup6F6WKz40EieegAoGv-ezzzg",
  },
  description: "Welcome to Kabianga Catholic Parish - St. John Paul II Parish, Diocese of Kericho.",
  keywords: [
    "kabianga",
    "kabianga parish",
    "kabianga catholic parish",
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
    canonical: "https://kabiangaparish.vercel.app/",
  },
  openGraph: {
    title: "Kabianga Catholic Parish",
    description: "Welcome to Kabianga Catholic Parish - St. John Paul II Parish, Diocese of Kericho.",
    url: "https://kabiangaparish.vercel.app/",
    siteName: "Kabianga Catholic Parish",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Kabianga Catholic Parish",
    "alternateName": ["Catholic Parish of Kabianga", "Kabianga Catholic Church"],
    "url": "https://kabiangaparish.vercel.app/",
  };

  // Clean Light Mode default fallback styles (white background, purple primary)
  const initialStyles = `
    :root {
      --color-primary: #7c3aed !important;
      --color-primary-hover: #6d28d9 !important;
      --color-on-primary: #ffffff !important;
      --color-background: #ffffff !important;
      --color-foreground: #1e1b4b !important;
      --background: #ffffff !important;
      --foreground: #1e1b4b !important;
      --card: #ffffff !important;
      --color-card: #ffffff !important;
      --card-foreground: #1e1b4b !important;
      --color-card-foreground: #1e1b4b !important;
      --border: #ddd6fe !important;
      --color-border: #ddd6fe !important;
    }
  `;

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <style id="initial-liturgical-theme" dangerouslySetInnerHTML={{ __html: initialStyles }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground pb-20 md:pb-0">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-4 md:mb-12">
            {children}
          </main>
          <footer className="w-full border-t border-border bg-card py-6 text-center text-xs text-muted-foreground mt-auto hidden md:block">
            <div className="max-w-7xl mx-auto px-4">
              <p>&copy; {new Date().getFullYear()} Kabianga Catholic Parish. All rights reserved.</p>
              <p className="mt-1 font-semibold">Serving God, Transforming Lives in the Diocese of Kericho.</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
