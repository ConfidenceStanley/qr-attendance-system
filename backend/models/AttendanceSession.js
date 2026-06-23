const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    qrMode: {
      type: String,
      enum: ["static", "dynamic"],
      default: "dynamic",
    },
    // The signed token embedded in the QR code
    qrToken: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    // Physical classroom location set by lecturer
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      radius: { type: Number, default: 50 }, // meters
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date, // set when session is closed
    },
    // Duration in minutes (auto-close trigger reference)
    duration: {
      type: Number,
      default: 30,
    },
    // Snapshot of enrolled students at session creation
    // Needed to calculate absences accurately
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    // Students who actually scanned
    attendees: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        scannedAt: {
          type: Date,
          default: Date.now,
        },
        scannedLocation: {
          latitude: Number,
          longitude: Number,
        },
        distance: Number, // meters from classroom
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);