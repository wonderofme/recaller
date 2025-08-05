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
  title: "Wonder of Recall - Latest U.S. Product Recalls & Safety Alerts",
  description: "Find the latest product recalls from FDA, CPSC, NHTSA, USDA, EPA, FTC and major manufacturers. Search recalls by product name, manufacturer, or safety issue. Updated daily with official recall notices.",
  keywords: "product recalls, FDA recalls, CPSC recalls, NHTSA recalls, USDA recalls, EPA recalls, FTC recalls, safety alerts, consumer protection, vehicle recalls, food recalls, toy recalls, electronics recalls, medical device recalls, pharmaceutical recalls, automotive recalls, home product recalls, child safety recalls, consumer product safety, recall search, recall database, official recalls, government recalls, manufacturer recalls, safety warnings, product safety alerts, recall notifications, consumer safety, product defects, safety recalls, recall information, recall lookup, recall checker, recall finder, recall database, recall search engine",
  authors: [{ name: "Wonder of Recall" }],
  creator: "Wonder of Recall",
  publisher: "Wonder of Recall",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wonderofrecall.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Wonder of Recall - Latest U.S. Product Recalls & Safety Alerts",
    description: "Find the latest product recalls from FDA, CPSC, NHTSA, USDA, EPA, FTC and major manufacturers. Search recalls by product name, manufacturer, or safety issue.",
    type: "website",
    locale: "en_US",
    url: "https://wonderofrecall.com",
    siteName: "Wonder of Recall",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Wonder of Recall - Product Recall Aggregator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wonder of Recall - Latest U.S. Product Recalls & Safety Alerts",
    description: "Find the latest product recalls from FDA, CPSC, NHTSA, USDA, EPA, FTC and major manufacturers.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Wonder of Recall",
              "description": "Latest U.S. product recalls and safety alerts from official government sources",
              "url": "https://wonderofrecall.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://wonderofrecall.com?search={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Wonder of Recall",
                "url": "https://wonderofrecall.com"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
