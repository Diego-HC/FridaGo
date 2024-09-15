import { env } from "./src/env.js"; // This ensures your env.js is loaded

/** @type {import("next").NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  swcMinify: false,
  "presets": ["next/babel"],
};

export default nextConfig;
