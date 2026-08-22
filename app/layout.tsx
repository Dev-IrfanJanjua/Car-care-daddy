import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
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
  // Light-only app. Declaring it stops the browser from auto-darkening form
  // controls, scrollbars, and other UA-painted chrome on a dark-mode OS.
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider delay={200}>
          {children}
          <Toaster />
        </TooltipProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
