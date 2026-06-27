const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["ND1", "ND2", "HND1", "HND2"],
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    guardian: {
      name: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      relationship: {
        type: String,
        default: "Guardian",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);