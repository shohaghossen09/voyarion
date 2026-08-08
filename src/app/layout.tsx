import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Voyarion — Premium Hotel & Car Booking Marketplace",
  description: "Discover handpicked hotels and rental cars from verified partners worldwide. Compare, book, and travel with confidence on the premium travel marketplace.",
  keywords: ["hotels", "car rental", "travel", "booking", "luxury", "vacation", "marketplace"],
  authors: [{ name: "Voyarion" }],
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Voyarion — Stay & Ride",
    description: "Premium hotel & car booking marketplace.",
    siteName: "Voyarion",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Voyarion", description: "Premium travel marketplace." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        suppressHydrationWarning
        className={`${playfair.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#141414",
              border: "1px solid #2A2A2A",
              color: "#FFFFFF",
            },
          }}
        />
      </body>
    </html>
  );
}
