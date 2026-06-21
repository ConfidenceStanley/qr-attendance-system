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
      required: [true, "Student/Matric number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      default: "Computer Science",
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      enum: ["ND1", "ND2", "HND1", "HND2"],
      default: "HND2",
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    guardian: {
      name: {
        type: String,
        required: [true, "Guardian name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Guardian email is required"],
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Guardian phone is required"],
        trim: true,
      },
      relationship: {
        type: String,
        required: [true, "Guardian relationship is required"],
        enum: ["Parent", "Guardian", "Sibling", "Spouse", "Other"],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);