import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://khanalnischal.com.np').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Nischal Khanal | Systems & Performance Engineer",
    template: "%s | Nischal Khanal",
  },
  description:
    "Software Engineer specialising in high-performance systems, low-latency infrastructure, market microstructure, and performance engineering.",
  keywords: [
    "systems engineering",
    "performance engineering",
    "low-latency",
    "market microstructure",
    "high-performance computing",
    "Nischal Khanal",
  ],
  authors: [{ name: "Nischal Khanal", url: baseUrl }],
  creator: "Nischal Khanal",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Nischal Khanal",
    title: "Nischal Khanal | Systems & Performance Engineer",
    description:
      "Software Engineer specialising in high-performance systems, low-latency infrastructure, and market microstructure.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nischal Khanal | Systems & Performance Engineer",
    description:
      "Software Engineer specialising in high-performance systems, low-latency infrastructure, and market microstructure.",
    creator: "@nischalkhanal",
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
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-800 selection:bg-slate-900 selection:text-white dark:bg-deep-dark dark:text-slate-200 dark:selection:bg-accent-blue dark:selection:text-deep-dark">
        {children}
      </body>
    </html>
  );
}
