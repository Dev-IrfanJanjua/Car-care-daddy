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

// A second face, used only on the two big poster-style headlines (the hero,
// and the why-choose-us section) via the `font-display` utility, mapped in
// globals.css. Deliberately its own token rather than repointing the existing
// `font-heading` -- that one is shadcn's CardTitle/SheetTitle base class, in
// near-constant use across /admin, and would have carried Oswald into every
// admin card title along with it. Oswald's condensed caps are what give those
// two headlines their poster-like weight; everywhere else stays Inter.
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
