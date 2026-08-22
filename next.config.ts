import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets other devices on the same network load the dev server (HMR, JS
  // chunks) -- Next.js blocks cross-origin dev requests by default. Dev-only;
  // has no effect on a production build. Covers common private-network
  // ranges since the machine's LAN IP varies (seen both 192.168.x.x and
  // 10.x.x.x this session).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  // Auto-generated placeholder imagery (marketing sections) until real photos
  // replace them.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;
