/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Allow LAN IPs (e.g. 192.168.3.24) to hit dev. Otherwise Next 16 blocks
  // them as "cross-origin" and the user sees a blank page. Restart `next dev`
  // after changing this.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.3.24",
  ],
};
export default nextConfig;
