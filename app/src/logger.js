function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationNs = process.hrtime.bigint() - startedAt;
    const durationMs = Number(durationNs) / 1_000_000;

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: res.statusCode >= 500 ? "error" : "info",
        message: "HTTP request completed",
        method: req.method,
        route: req.route?.path || req.path,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(3)),
        userAgent: req.get("user-agent") || "unknown",
      })
    );
  });

  next();
}

module.exports = {
  requestLogger,
};
