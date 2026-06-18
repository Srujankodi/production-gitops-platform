const request = require("supertest");
const app = require("../src/app");

describe("TaskFlow API", () => {
  test("GET / returns application information", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.application).toBe("TaskFlow API");
    expect(response.body.status).toBe("running");
  });

  test("GET /health returns healthy status", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("healthy");
    expect(response.body.timestamp).toBeDefined();
  });

  test("GET /ready returns ready status", async () => {
    const response = await request(app).get("/ready");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ready");
  });

  test("GET /api/tasks returns an array", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /api/tasks creates a task", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Configure Argo CD",
        status: "todo",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Configure Argo CD");
    expect(response.body.status).toBe("todo");
  });

  test("POST /api/tasks rejects an empty title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("A valid title is required");
  });

  test("GET /metrics returns Prometheus metrics", async () => {
    const response = await request(app).get("/metrics");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("taskflow_http_requests_total");
  });
});