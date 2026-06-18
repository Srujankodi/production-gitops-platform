const client = require("prom-client");

const register = client.register;

// Collect Node.js process metrics such as memory, CPU and event-loop data.
client.collectDefaultMetrics({
  register,
  prefix: "taskflow_",
});

const httpRequestsTotal =
  register.getSingleMetric("taskflow_http_requests_total") ||
  new client.Counter({
    name: "taskflow_http_requests_total",
    help: "Total number of HTTP requests received by TaskFlow API",
    labelNames: ["method", "route", "status_code"],
    registers: [register],
  });

const httpRequestDurationSeconds =
  register.getSingleMetric("taskflow_http_request_duration_seconds") ||
  new client.Histogram({
    name: "taskflow_http_request_duration_seconds",
    help: "Duration of TaskFlow API HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [register],
  });

function metricsMiddleware(req, res, next) {
  if (req.path === "/metrics") {
    return next();
  }

  const endTimer = httpRequestDurationSeconds.startTimer();

  res.on("finish", () => {
    const route = req.route?.path || req.path || "unknown";
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });

  next();
}

module.exports = {
  client,
  register,
  metricsMiddleware,
};
