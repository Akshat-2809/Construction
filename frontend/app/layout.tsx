import type { Metadata } from "next";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WhatsappButton from "@/components/layout/WhatsappButton";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/themeContext";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://myequipo.com"),
  title: {
    default: "Myequipo — Construction Machinery Rental India | Excavator, Crane, JCB on Rent",
    template: "%s | Myequipo",
  },
  description:
    "Rent construction machinery near you — Excavators, Cranes, JCBs, Concrete Pumps, Fiori mixers. Connect directly with machine owners across India. No middlemen, no markup. List your machine free.",
  keywords: [
    "construction machinery rent India",
    "excavator on rent",
    "JCB hire India",
    "crane rental India",
    "concrete pump rent",
    "Fiori mixer rent",
    "construction equipment rental",
    "machinery marketplace India",
    "excavator rent Indore",
    "crane rent Jaipur",
    "JCB rent Bhopal",
    "construction machinery Rajasthan",
    "construction equipment Madhya Pradesh",
    "list construction machine",
    "rent excavator near me",
    "Myequipo",
  ],
  authors: [{ name: "Myequipo", url: "https://myequipo.com" }],
  creator: "Myequipo",
  publisher: "Myequipo",
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://myequipo.com",
    siteName: "Myequipo",
    title: "Myequipo — Construction Machinery Rental India",
    description:
      "Find and rent construction machinery near you. Browse excavators, cranes, JCBs, concrete pumps and more. Connect directly with machine owners — no middlemen.",
    images: [
      {
        url: "/logo1.webp",
        width: 1200,
        height: 630,
        alt: "Myequipo — Construction Machinery Marketplace India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Myequipo — Construction Machinery Rental India",
    description:
      "Rent excavators, cranes, JCBs & more directly from owners. No middlemen, no markup.",
    images: ["/logo1.webp"],
  },
  alternates: {
    canonical: "https://myequipo.com",
  },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />
        <link rel="canonical" href="https://myequipo.com" />
        {/* Structured data — helps Google understand what Myequipo is */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Myequipo",
              url: "https://myequipo.com",
              description:
                "Construction machinery rental marketplace in India. Rent excavators, cranes, JCBs, concrete pumps directly from owners.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://myequipo.com/machinery?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <WhatsappButton />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}