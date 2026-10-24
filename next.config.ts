import type { NextConfig } from "next";

// Hero media uploaded from /admin/appearance lives in the Supabase storage
// bucket, so next/image must be allowed to load from the project's host.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return "";
  }
})();

const isProd = process.env.NODE_ENV === "production";
const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : "";
const gaId = process.env.NEXT_PUBLIC_GA_ID ? " https://www.googletagmanager.com" : "";
const gaConnect = process.env.NEXT_PUBLIC_GA_ID
  ? " https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com"
  : "";

// Content-Security-Policy. Production only (dev tooling needs eval/websockets).
// 'unsafe-inline' is required for Next's inline bootstrap + the pre-paint theme
// script; everything else is locked to this site, Supabase storage/API and
// (optionally) Google Analytics.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${gaId}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://i.pravatar.cc ${supabaseOrigin} https://*.google-analytics.com`.trim(),
  `media-src 'self' blob: ${supabaseOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseOrigin.replace("https://", "wss://")}${gaConnect}`.trim(),
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  ...(isProd
    ? [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=31536000" },
      ]
    : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Lets other devices on the same network load the dev server (HMR, JS
  // chunks) -- Next.js blocks cross-origin dev requests by default. Dev-only;
  // has no effect on a production build. Covers common private-network
  // ranges since the machine's LAN IP varies (seen both 192.168.x.x and
  // 10.x.x.x this session).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  // Only the testimonial avatars are still remote placeholders; every other
  // image is a real local file under public/images.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost }] : []),
    ],
  },
};

export default nextConfig;
