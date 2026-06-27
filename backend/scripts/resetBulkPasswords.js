require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const BULK_DEFAULT_PASSWORD = "QRoll@1234";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Generate correct hash once
  const correctHash = await bcrypt.hash(BULK_DEFAULT_PASSWORD, 12);
  console.log("New hash generated:", correctHash);

  // Sanity check the hash before applying to anyone
  const sanityCheck = await bcrypt.compare(BULK_DEFAULT_PASSWORD, correctHash);
  console.log("Sanity check (must be true):", sanityCheck);

  if (!sanityCheck) {
    console.error("Hash sanity check failed. Aborting.");
    process.exit(1);
  }

  // Find all students and lecturers
  const users = await User.find({
    role: { $in: ["student", "lecturer"] },
  });

  console.log(`\nFound ${users.length} users to reset\n`);

  let fixed = 0;
  let errored = 0;

  for (const user of users) {
    try {
      // Use updateOne — bypasses pre-save hook
      // So the hash we write is stored exactly as-is
      await User.updateOne(
        { _id: user._id },
        { $set: { password: correctHash } }
      );
      console.log(`  Reset: ${user.email}`);
      fixed++;
    } catch (userErr) {
      console.log(`  ERROR on ${user.email}: ${userErr.message}`);
      errored++;
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`Reset:   ${fixed}`);
  console.log(`Errors:  ${errored}`);
  console.log(`Total:   ${users.length}`);
  console.log(`─────────────────────────────`);

  // ── Verify one user ──
  // Must use .select("+password") because password has select:false in model
  const testUser = await User
    .findOne({ role: { $in: ["student", "lecturer"] } })
    .select("+password");

  if (testUser) {
    const verified = await bcrypt.compare(BULK_DEFAULT_PASSWORD, testUser.password);
    console.log(`\nVerification on ${testUser.email}: ${verified ? "✓ PASS" : "✗ FAIL"}`);

    if (!verified) {
      console.log("Stored hash:", testUser.password);
      console.log("Expected match for:", BULK_DEFAULT_PASSWORD);
    }
  }

  await mongoose.disconnect();
  console.log("\nDone. Try logging in with QRoll@1234");
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});