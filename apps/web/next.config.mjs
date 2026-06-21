import os from "node:os";

/** @type {import('next').NextConfig} */
const apiOrigin = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";
const localNetworkOrigins = Object.values(os.networkInterfaces())
  .flat()
  .filter((address) => address?.family === "IPv4" && !address.internal)
  .map((address) => address.address);

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["localhost", "127.0.0.1", ...localNetworkOrigins],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
