const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

const basePath = "/hls-proxy";
const targetBase = "http://werudigital.flashmediacast.com:1935";

// Health check endpoint
app.get(`${basePath}/ping`, (req, res) => {
  res.send("pong");
});

// HLS proxy endpoint
app.use(
  `${basePath}/hls`,
  createProxyMiddleware({
    target: targetBase,
    changeOrigin: true,
    secure: false,
    logLevel: "debug", // <-- Add this for verbose output
    pathRewrite: (path, req) => {
      const rewrittenPath = path.replace(
        `${basePath}/hls`,
        "/WeruDigital/livestream"
      );
      console.log(`🔄 Rewriting path: ${path} -> ${rewrittenPath}`);
      return rewrittenPath;
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`➡️ Proxying request: ${req.method} ${req.originalUrl}`);
      console.log(`   Headers: ${JSON.stringify(req.headers)}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(
        `✅ Proxy response from target: ${proxyRes.statusCode} for ${req.originalUrl}`
      );
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
      proxyRes.headers["Access-Control-Allow-Headers"] =
        "Origin, X-Requested-With, Content-Type, Accept";
    },
    onError: (err, req, res) => {
      console.error(`❌ Proxy error on ${req.originalUrl}:`, err.message);
      res.status(500).send("Proxy error occurred");
    },
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Node HLS Proxy running on port ${PORT}`);
});
