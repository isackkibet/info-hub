import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for NextAuth v5 on Vercel — trusts the x-forwarded-host header
  // so cookies are set on the correct domain behind Vercel's load balancer.
  env: {
    AUTH_TRUST_HOST: "true",
  },
};

export default nextConfig;
