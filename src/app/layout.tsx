import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${inter.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
