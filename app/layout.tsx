import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
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

// A second face, used in exactly one place: the hero H1 (via the `font-heading`
// utility, mapped in globals.css). Oswald's condensed caps are what give that
// headline its poster-like weight -- Inter at the same size just looks
// stretched. Everywhere else, including every other heading, stays Inter: one
// display face spent on one moment reads as deliberate, not as two competing
// type systems.
const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Car Care Daddy",
  description:
    "Professional CeO₂ windshield restoration and full glass polishing at your doorstep in Lahore. Instant transparent pricing, 3-year results warranty.",
};

export const viewport = {
  // The page ground -- matches the header the browser chrome sits above.
  themeColor: "#0b0b0c",
  // Dark-only app. Declaring it makes the browser paint form controls,
  // scrollbars and other UA chrome dark regardless of the OS setting.
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} h-full antialiased`}>
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
