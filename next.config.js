/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ant-design/x', '@ant-design/charts'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

module.exports = nextConfig;
