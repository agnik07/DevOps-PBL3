const request = require("supertest");
const app = require("../app");

describe("Auth API", () => {
  it("health endpoint works", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
