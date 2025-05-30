// test/setup.js
jest.setTimeout(10000);
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase(); // Optional safety
  await mongoose.connection.close();
});
