const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/oauth2/token",
        createProxyMiddleware({
            target: "https://172.28.80.1:9443",
            changeOrigin: true,
            secure: false,
        })
    );
};