import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  turbopack: {
    root: configDirectory
  },
  async headers() {
    return [
      {
        // API routes: permite CORS apenas para origens OTTO conhecidas
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://otto-pwa.vercel.app" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,POST,PUT,DELETE" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" }
        ]
      },
      {
        // Páginas: permite embed como iframe apenas de origens OTTO conhecidas
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' http://localhost:* https://*.vercel.app https://otto-pwa.vercel.app;" }
        ]
      }
    ];
  }
};

export default nextConfig;
