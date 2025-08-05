import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recall Alert - U.S. Product Recall Aggregator",
  description: "Stay informed about the latest product recalls from FDA, CPSC, NHTSA, and USDA. Get real-time alerts and search through official recall notices.",
  keywords: "product recalls, FDA recalls, CPSC recalls, NHTSA recalls, USDA recalls, safety alerts, consumer protection",
  authors: [{ name: "Recall Alert" }],
  openGraph: {
    title: "Recall Alert - U.S. Product Recall Aggregator",
    description: "Stay informed about the latest product recalls from official U.S. government sources.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recall Alert - U.S. Product Recall Aggregator",
    description: "Stay informed about the latest product recalls from official U.S. government sources.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
