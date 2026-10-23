import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
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

// Display face for headlines (the `font-display` utility, mapped in
// globals.css). Deliberately its own token rather than repointing
// `font-heading` -- that one is shadcn's CardTitle/SheetTitle base class, in
// near-constant use across /admin, and stays Inter.
const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Car Aurum | Premium Auto Care", template: "%s | Car Aurum" },
  description:
    "Professional CeO₂ windshield restoration and full glass polishing at your doorstep in Lahore. Instant transparent pricing, 3-year results warranty.",
};

export const viewport = {
  // Browser chrome colour per theme. The in-page toggle overrides the OS
  // setting, so the meta tag is kept in step by ThemeToggle at runtime.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0e2b25" },
  ],
  colorScheme: "light dark",
};

// Runs before first paint so there is no flash of the wrong theme. Light is
// the default; a saved choice wins.
const themeInit = `try{var t=localStorage.getItem('ca-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
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
