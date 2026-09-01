/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // nodemailer (used by lib/email.js in the contact-form server action) relies
  // on Node's require and dynamic imports — keep it out of the server bundle.
  serverExternalPackages: ["nodemailer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
