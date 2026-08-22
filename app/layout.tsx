import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";
import { MotionProvider } from "@/components/motion-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Car Care Daddy",
  description:
    "Professional CeO₂ windshield restoration and full glass polishing at your doorstep in Lahore. Instant transparent pricing, 3-year results warranty.",
};

export const viewport = {
  // Midnight navy -- matches the hero band the browser chrome sits above.
  themeColor: "#0a1128",
  // Light-only app. Declaring it stops the browser from auto-darkening form
  // controls, scrollbars, and other UA-painted chrome on a dark-mode OS.
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MotionProvider>
          <TooltipProvider delay={200}>
            {children}
            <Toaster />
          </TooltipProvider>
        </MotionProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
