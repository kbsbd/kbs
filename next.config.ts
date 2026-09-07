import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // real estate development moved from a CMS page to a built-in route
      {
        source: "/:locale(en|bn)/p/real-estate-development",
        destination: "/:locale/real-estate-development",
        permanent: true,
      },
      {
        source: "/p/real-estate-development",
        destination: "/en/real-estate-development",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
