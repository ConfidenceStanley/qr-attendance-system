// ─── Load .env from backend root (one level up from scripts/) ───
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ── Debug: confirm env loaded ──
console.log("MONGO_URI loaded:", process.env.MONGO_URI ? "✅ YES" : "❌ UNDEFINED");

const BULK_DEFAULT_PASSWORD = "QRoll@1234";

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is undefined. Check your .env file location.");
    console.error("   Script is at:", __dirname);
    console.error("   Looking for .env at:", require("path").resolve(__dirname, "../.env"));
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // ── Step 1: Generate a clean single hash ──
  const correctHash = await bcrypt.hash(BULK_DEFAULT_PASSWORD, 12);
  console.log("New hash generated:", correctHash);

  // ── Step 2: Sanity check before touching ANY records ──
  const sanityCheck = await bcrypt.compare(BULK_DEFAULT_PASSWORD, correctHash);
  console.log("Sanity check (must be true):", sanityCheck);

  if (!sanityCheck) {
    console.error("❌ Hash sanity check failed. Aborting.");
    process.exit(1);
  }

  // ── Step 3: Find all non-admin users ──
  const users = await User.find({
    role: { $in: ["student", "lecturer"] },
  });

  console.log(`\nFound ${users.length} users to reset\n`);

  let fixed = 0;
  let errored = 0;

  for (const user of users) {
    try {
      // updateOne bypasses pre-save hook — no re-hashing
      await User.updateOne(
        { _id: user._id },
        { $set: { password: correctHash } }
      );
      console.log(`  ✓ Reset: ${user.email}`);
      fixed++;
    } catch (userErr) {
      console.log(`  ✗ ERROR on ${user.email}: ${userErr.message}`);
      errored++;
    }
  }

  console.log(`\n─────────────────────────────`);
  console.log(`Reset:   ${fixed}`);
  console.log(`Errors:  ${errored}`);
  console.log(`Total:   ${users.length}`);
  console.log(`─────────────────────────────`);

  // ── Step 4: Verify a sample user ──
  const testUser = await User.findOne({
    role: { $in: ["student", "lecturer"] },
  }).select("+password");

  if (testUser) {
    const verified = await bcrypt.compare(
      BULK_DEFAULT_PASSWORD,
      testUser.password
    );
    console.log(
      `\nVerification on "${testUser.email}": ${verified ? "✅ PASS" : "❌ FAIL"}`
    );

    if (!verified) {
      console.log("Stored hash:", testUser.password);
      console.log("Expected match for:", BULK_DEFAULT_PASSWORD);
    }
  }

  await mongoose.disconnect();
  console.log("\n✅ Done. All users can now log in with: QRoll@1234");
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});