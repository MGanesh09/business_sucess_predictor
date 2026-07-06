import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Business Success Predictor AI - Premium Startup Location Analyzer",
  description: "Predict the success probability of starting a business at any location using advanced AI models. Analyze demographics, competitors, revenue forecasts, foot traffic, and receive tailored recommendations.",
  keywords: ["startup success predictor", "business analysis", "location analytics", "geomarketing", "AI revenue forecast", "competitor heatmap"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased dark`}>
      <head>
        {/* Leaflet CSS styling helper link */}
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full bg-[#030712] text-[#f3f4f6] font-sans">
        {children}
      </body>
    </html>
  );
}
