/**
 * One-time sync script
 * 
 * Fixes existing course assignments by updating
 * lecturer.courses[] and student.courses[] arrays
 * to match what is in course.lecturer and course.students
 * 
 * Run with: node scripts/syncCourseAssignments.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Course = require("../models/Course");
const Lecturer = require("../models/Lecturer");
const Student = require("../models/Student");

const syncAssignments = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    console.log("");

    // Get all courses
    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} course(s) to process`);
    console.log("");

    let lecturersUpdated = 0;
    let studentsUpdated = 0;

    for (const course of courses) {
      console.log(`Processing: ${course.courseCode}`);

      // Sync lecturer
      if (course.lecturer) {
        const lecturer = await Lecturer.findById(course.lecturer);
        if (lecturer) {
          // Add course to lecturer if not already there
          if (!lecturer.courses.some(c => c.toString() === course._id.toString())) {
            lecturer.courses.push(course._id);
            await lecturer.save();
            lecturersUpdated++;
            console.log(`  ✓ Added course to lecturer ${lecturer.staffId}`);
          } else {
            console.log(`  - Lecturer already has this course`);
          }
        }
      } else {
        console.log(`  - No lecturer assigned`);
      }

      // Sync students
      if (course.students && course.students.length > 0) {
        for (const studentId of course.students) {
          const student = await Student.findById(studentId);
          if (student) {
            if (!student.courses.some(c => c.toString() === course._id.toString())) {
              student.courses.push(course._id);
              await student.save();
              studentsUpdated++;
              console.log(`  ✓ Added course to student ${student.studentId}`);
            }
          }
        }
        if (course.students.length === 0) {
          console.log(`  - No students enrolled`);
        }
      } else {
        console.log(`  - No students enrolled`);
      }

      console.log("");
    }

    console.log("─────────────────────────────");
    console.log(`✅ Sync complete!`);
    console.log(`   Lecturers updated: ${lecturersUpdated}`);
    console.log(`   Student records updated: ${studentsUpdated}`);
    console.log("─────────────────────────────");

    process.exit(0);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
};

syncAssignments();