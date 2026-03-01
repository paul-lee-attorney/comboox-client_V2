// @ts-check
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    // Resolve `fs` and other Node.js modules to empty in the browser environment
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        module: false
      };
    }
    return config;
  },
}
 
module.exports = nextConfig