import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";
import { MotionProvider } from "@/components/motion-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { getBrandSettings, buildBrandCss, type DefaultTheme } from "@/features/brand";
import { siteUrl } from "@/lib/site-url";

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
  metadataBase: new URL(siteUrl()),
  title: { default: "Car Aurum | Premium Auto Care", template: "%s | Car Aurum" },
  description:
    "Professional CeO₂ windshield restoration and full glass polishing at your doorstep in Lahore. Instant transparent pricing, 3-year results warranty.",
  openGraph: {
    type: "website",
    siteName: "Car Aurum",
    title: "Car Aurum | Premium Auto Care",
    description:
      "Doorstep windshield, glass and headlight restoration in Lahore. Instant pricing, 3-year results warranty.",
    images: [{ url: "/images/hero-poster.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
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

// Runs before first paint so there is no flash of the wrong theme. A visitor's
// saved choice wins; otherwise the admin's default (light unless changed).
const themeInit = (def: DefaultTheme) =>
  `try{var d=${JSON.stringify(def)},t=localStorage.getItem('ca-theme');if(t!=='dark'&&t!=='light')t=d==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):d;document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const brand = await getBrandSettings();
  const brandCss = buildBrandCss(brand);
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit(brand.defaultTheme) }} />
        {brandCss && <style id="brand-tokens" dangerouslySetInnerHTML={{ __html: brandCss }} />}
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
