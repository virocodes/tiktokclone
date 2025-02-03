const { withNextVideo } = require('next-video/process')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: '*',
      port: '',
    }],
  },
};

module.exports = withNextVideo(nextConfig);
