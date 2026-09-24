import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cuando las fotos vivan en Supabase Storage, agregar el dominio acá.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
