require("dotenv").config();
const mongoose = require("mongoose");

// Register all models first
require("../models/User");
require("../models/Student");
require("../models/Lecturer");
require("../models/Course");
const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");

const backfill = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    const sessions = await AttendanceSession.find({});
    console.log(`Found ${sessions.length} sessions`);

    let createdPresent = 0;
    let createdAbsent = 0;
    let skipped = 0;

    for (const session of sessions) {
      const enrolledIds = session.enrolledStudents.map((id) => id.toString());
      const attendedIds = session.attendees.map((a) => a.student.toString());

      // Create PRESENT records for those who scanned
      for (const attendee of session.attendees) {
        const exists = await AttendanceRecord.findOne({
          session: session._id,
          student: attendee.student,
        });

        if (exists) {
          skipped++;
          continue;
        }

        await AttendanceRecord.create({
          session: session._id,
          student: attendee.student,
          course: session.course,
          status: "present",
          scannedAt: attendee.scannedAt,
          scannedLocation: attendee.scannedLocation,
          distance: attendee.distance,
        });
        createdPresent++;
      }

      // Create ABSENT records only for closed sessions
      if (session.status === "closed") {
        const absentIds = enrolledIds.filter(
          (id) => !attendedIds.includes(id)
        );

        for (const studentId of absentIds) {
          const exists = await AttendanceRecord.findOne({
            session: session._id,
            student: studentId,
          });

          if (exists) {
            skipped++;
            continue;
          }

          await AttendanceRecord.create({
            session: session._id,
            student: studentId,
            course: session.course,
            status: "absent",
          });
          createdAbsent++;
        }
      }
    }

    console.log(`✅ Created ${createdPresent} present records`);
    console.log(`✅ Created ${createdAbsent} absent records`);
    console.log(`⏭️  Skipped ${skipped} existing records`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

backfill();