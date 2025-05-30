// test/auth.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/Users");

const testUser = {
  username: "jestuser",
  email: "jestuser@example.com",
  password: "password123",
};

describe("Auth Routes", () => {
  beforeAll(async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const user = await User.findOne({ email: testUser.email });
    user.isVerified = true;
    await user.save();
  });

  it("should login the user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });
});
