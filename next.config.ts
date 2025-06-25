import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [new URL('https://image.tmdb.org/**')],
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  }
};

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig);
