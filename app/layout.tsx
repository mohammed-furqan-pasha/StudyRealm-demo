import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SITE_URL, ALLOW_INDEXING } from "./lib/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

const title = "StudyRealm — LKG-10 EdTech Platform for Indian Schools";
const description = "Interactive learning moments, real-time mastery tracking, and NCF 2023 auto-compliance for CBSE, ICSE, and Karnataka State Board schools.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    type: 'website',
    siteName: 'StudyRealm',
    locale: 'en_IN',
    url: SITE_URL,
    title,
    description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StudyRealm interactive demo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
  robots: {
    index: ALLOW_INDEXING,
    follow: ALLOW_INDEXING,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="overflow-x-hidden" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
