import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-88ca2fd4f575431997b7da6865fa80c6.r2.dev",
      },
    ],
  },
};

export default nextConfig;
