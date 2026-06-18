const express = require("express");
const { register, metricsMiddleware } = require("./metrics");

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(metricsMiddleware);

// Temporary in-memory task storage.
// A database will replace this later.
const tasks = [
  {
    id: 1,
    title: "Build TaskFlow API",
    status: "done",
  },
];

// Application information
app.get("/", (req, res) => {
  res.status(200).json({
    application: "TaskFlow API",
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    status: "running",
  });
});

// Kubernetes liveness endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Kubernetes readiness endpoint
app.get("/ready", (req, res) => {
  res.status(200).json({
    status: "ready",
    timestamp: new Date().toISOString(),
  });
});

// Return all tasks
app.get("/api/tasks", (req, res) => {
  res.status(200).json(tasks);
});

// Create a new task
app.post("/api/tasks", (req, res) => {
  const title =
    typeof req.body.title === "string"
      ? req.body.title.trim()
      : "";

  if (!title) {
    return res.status(400).json({
      error: "A valid title is required",
    });
  }

  const task = {
    id: tasks.length
      ? Math.max(...tasks.map((existingTask) => existingTask.id)) + 1
      : 1,
    title,
    status: "todo",
  };

  tasks.push(task);

  return res.status(201).json(task);
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res, next) => {
  try {
    res.setHeader("Content-Type", register.contentType);
    res.status(200).send(await register.metrics());
  } catch (error) {
    next(error);
  }
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Central error handler
app.use((error, req, res, next) => {
  console.error("Unhandled application error:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: "Internal Server Error",
  });
});

module.exports = app;
