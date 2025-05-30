// test/upload.test.js
const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../server");
const User = require("../models/Users");

let token;

describe("Upload Route", () => {
  beforeAll(async () => {
    const testUser = {
      username: "uploadtester",
      email: "upload@example.com",
      password: "uploadpass",
    };

    await request(app).post("/api/auth/register").send(testUser);

    const user = await User.findOne({ email: testUser.email });
    user.isVerified = true;
    await user.save();

    const loginRes = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    token = loginRes.body.token;
  });

  it("should upload a GCODE file", async () => {
    const filePath = path.join(__dirname, "test.gcode");
    fs.writeFileSync(filePath, "G28 ; Home all axes");

    const res = await request(app)
      .post("/api/print-jobs/upload")
      .set("Authorization", `Bearer ${token}`)
      .field("printer", "EnderDirect")
      .attach("file", filePath);

    expect(res.statusCode).toBe(201);
    expect(res.body.file.filename).toMatch(/\.gcode$/);
    expect(res.body.file.status).toMatch(/queued|sent|ready/);

    fs.unlinkSync(filePath); // cleanup
  });
});
