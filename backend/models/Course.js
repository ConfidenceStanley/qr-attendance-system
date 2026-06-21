const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    courseTitle: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },

    creditUnits: {
      type: Number,
      required: [true, "Credit units required"],
      min: 1,
      max: 6,
      default: 3,
    },

    level: {
      type: String,
      required: [true, "Level is required"],
      // Matches your Student model enum exactly
      enum: ["ND1", "ND2", "HND1", "HND2"],
    },

    semester: {
      type: String,
      required: [true, "Semester is required"],
      enum: ["First", "Second"],
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      default: "Computer Science",
    },

    // One lecturer per course
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      default: null,
    },

    // Many students per course
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    academicSession: {
      type: String,
      required: [true, "Academic session is required"],
      trim: true,
      // Example: "2024/2025"
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: student count without fetching full array
courseSchema.virtual("studentCount").get(function () {
  return this.students.length;
});

courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Course", courseSchema);