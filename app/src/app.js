const express = require("express");
const client = require("prom-client");

const app = express();

app.use(express.json());

client.collectDefaultMetrics({
  prefix: "taskflow_",
});

const requestCounter = new client.Counter({
  name: "taskflow_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

app.use((req, res, next) => {
  res.on("finish", () => {
    requestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });

  next();
});

const tasks = [
  {
    id: 1,
    title: "Build GitOps platform",
    status: "in-progress",
  },
];

app.get("/", (_req, res) => {
  res.status(200).json({
    application: "TaskFlow API",
    environment: process.env.NODE_ENV || "development",
    version: process.env.APP_VERSION || "1.0.0",
    status: "running",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", (_req, res) => {
  res.status(200).json({
    status: "ready",
  });
});

app.get("/api/tasks", (_req, res) => {
  res.status(200).json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const { title, status = "todo" } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({
      error: "A valid title is required",
    });
  }

  const task = {
    id: tasks.length + 1,
    title,
    status,
  };

  tasks.push(task);

  return res.status(201).json(task);
});

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

module.exports = app;