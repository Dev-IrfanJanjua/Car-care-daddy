import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Car Care",
  description:
    "Instant transparent pricing for windshield chip repair, polishing, headlight restoration, and other mobile auto-glass services.",
};

export const viewport = {
  themeColor: "#0d9488",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
