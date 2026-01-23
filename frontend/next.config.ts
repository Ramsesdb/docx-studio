import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Enable React strict mode
  reactStrictMode: true,

  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
