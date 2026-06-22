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

    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      default: null,
    },

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
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field - safe student count
// Returns 0 if students array not populated
courseSchema.virtual("studentCount").get(function () {
  return this.students ? this.students.length : 0;
});

courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Course", courseSchema);