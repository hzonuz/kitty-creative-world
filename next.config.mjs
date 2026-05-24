/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
