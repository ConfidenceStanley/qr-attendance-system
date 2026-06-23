const mongoose = require("mongoose");

// One record per student per session - created when session closes
// This is the permanent historical record
const attendanceRecordSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "absent",
    },
    scannedAt: {
      type: Date, // null if absent
    },
    scannedLocation: {
      latitude: Number,
      longitude: Number,
    },
    distance: {
      type: Number, // meters, null if absent
    },
    // Manual override support
    manuallyEdited: {
      type: Boolean,
      default: false,
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    editNote: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate records per student per session
attendanceRecordSchema.index(
  { session: 1, student: 1 },
  { unique: true }
);

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);