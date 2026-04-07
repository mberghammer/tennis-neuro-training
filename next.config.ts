import type { NextConfig } from "next"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/app-build-manifest\.json$/],
  fallbacks: {
    document: "/offline",
  },
})

const nextConfig: NextConfig = {
  // No strictmode to avoid double-firing RAF in dev
}

export default withPWA(nextConfig)
