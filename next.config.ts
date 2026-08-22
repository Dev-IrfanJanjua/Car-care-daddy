import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
