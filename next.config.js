// next.config.js
const withPlugins = require("next-compose-plugins");
const offline = require("next-offline");

const nextConfig = {
  target: process.env.NODE_ENV !== "production" ? "server" : "serverless",
  dontAutoRegisterSw: true,
  generateSw: false,
  devSwSrc: "./public/sw.js",
  workboxOpts: {
    swSrc: "./public/sw.js",
    swDest: "./public/service-worker.js"
  },
};

module.exports = withPlugins([[offline]], nextConfig);
