import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { LayoutShell } from "@/components/layout/layout-shell";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invoice Ledger | R.S Engineering",
  description: "Internal invoice ledger system for R.S Engineering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
