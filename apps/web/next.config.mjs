/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@radar-domace/api", "@radar-domace/config", "@radar-domace/types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
