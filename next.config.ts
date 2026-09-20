import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  serverExternalPackages: ["postgres"],
  async headers() {
    return [{
      source: "/(.*)",
      headers: [...securityHeaders],
    }];
  },
};

export default nextConfig;
