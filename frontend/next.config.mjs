/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    ENOKI_PUB_KEY: process.env.ENOKI_PUB_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    VOTING_MODULE_ADDRESS: process.env.VOTING_MODULE_ADDRESS,
    VOTES_OBJECT_ADDRESS: process.env.VOTES_OBJECT_ADDRESS,
  },
};

export default nextConfig;
