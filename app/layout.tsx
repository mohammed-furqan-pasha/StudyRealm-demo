import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StudyRealm — K-10 EdTech Platform for Indian Schools",
  description: "Interactive learning moments, real-time mastery tracking, and NCF 2023 auto-compliance for CBSE, ICSE, and Karnataka State Board schools.",
  openGraph: {
    title: "StudyRealm — Where Every Student Learns",
    description: "Experience a live interactive chapter. Book a 30-minute demo for your school.",
    url: "https://studyrealm.app",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
