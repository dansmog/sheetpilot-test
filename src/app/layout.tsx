import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SheetPilot — Multi-tenant Shift Planning",
  description:
    "SheetPilot gives operations teams branded client portals, a shared console, Google Sheets sync, and subscription plans with messaging credits so every tenant runs smoothly.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "SheetPilot — Multi-tenant Shift Planning",
    description:
      "SheetPilot gives operations teams branded client portals, a shared console, Google Sheets sync, and subscription plans with messaging credits so every tenant runs smoothly.",
    url: "https://www.sheetpilot.app",
    siteName: "SheetPilot",
    images: [
      {
        url: "https://ziracle.com/OGImage.png", // must be absolute URL
        width: 1200,
        height: 630,
        alt: "SheetPilot — Multi-tenant Shift Planning",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
