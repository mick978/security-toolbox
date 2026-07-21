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
  // Build-time worker cap. Default is `Math.floor(os.freemem()/1e9)` (e.g.
  // 4-5 workers on an 8GB Mac). Each worker holds the entire app bundle
  // (~1.2 GB resident), so multi-worker trace collection races and OOMs.
  // Pin to 1 to keep memory under 4 GB and avoid the `_not-found/page.js.nft.json`
  // and `pages-manifest.json` ENOENT races we kept hitting on Next 16.
  experimental: {
    cpus: 1,
  },
};
export default nextConfig;
