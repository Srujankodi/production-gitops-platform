const app = require("./app");

const port = process.env.PORT || 3001;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`TaskFlow API is running on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully.`);

  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
