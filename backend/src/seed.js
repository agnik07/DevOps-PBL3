require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("./models/User");

async function run() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required to seed the database");
  await mongoose.connect(process.env.MONGO_URI);

  const passwordHash = await bcrypt.hash("123456", 10);

  const teacher = await User.findOneAndUpdate(
    { email: "teacher@test.com" },
    {
      name: "Demo Teacher",
      email: "teacher@test.com",
      password: passwordHash,
      role: "teacher",
      rollNo: "",
      className: "Demo",
      avatar: "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const student = await User.findOneAndUpdate(
    { email: "student@test.com" },
    {
      name: "Demo Student",
      email: "student@test.com",
      password: passwordHash,
      role: "student",
      rollNo: "STU001",
      className: "Demo",
      avatar: "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Seed complete");
  console.log("Teacher:", { email: teacher.email, password: "123456" });
  console.log("Student:", { email: student.email, password: "123456" });

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
