const Course = require("../models/Course");
const Lecturer = require("../models/Lecturer");
const Student = require("../models/Student");

// ─────────────────────────────────────────────
// @desc    Create new course
// @route   POST /api/admin/courses
// @access  Admin only
// ─────────────────────────────────────────────
const createCourse = async (req, res) => {
  try {
    const {
      courseCode,
      courseTitle,
      creditUnits,
      level,
      semester,
      department,
      academicSession,
    } = req.body;

    if (
      !courseCode ||
      !courseTitle ||
      !level ||
      !semester ||
      !academicSession
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course code, title, level, semester and academic session are required",
      });
    }

    // Validate level matches Student/Lecturer enum
    const validLevels = ["ND1", "ND2", "HND1", "HND2"];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: `Level must be one of: ${validLevels.join(", ")}`,
      });
    }

    const existing = await Course.findOne({
      courseCode: courseCode.toUpperCase(),
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Course code ${courseCode.toUpperCase()} already exists`,
      });
    }

    const course = await Course.create({
      courseCode,
      courseTitle,
      creditUnits: creditUnits || 3,
      level,
      semester,
      department: department || "Computer Science",
      academicSession,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating course",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Admin only
// ─────────────────────────────────────────────
const getAllCourses = async (req, res) => {
  try {
    const { search, level, semester } = req.query;

    let filter = {};
    if (level) filter.level = level;
    if (semester) filter.semester = semester;
    if (search) {
      filter.$or = [
        { courseCode: { $regex: search, $options: "i" } },
        { courseTitle: { $regex: search, $options: "i" } },
      ];
    }

    const courses = await Course.find(filter)
      .populate({
        path: "lecturer",
        populate: {
          path: "user",
          select: "fullName email",
        },
      })
      .sort({ courseCode: 1 });

    // Format with lecturer name and student count
    // IMPORTANT: use fullName (matches User.js) not firstName/lastName
    const formatted = courses.map((course) => ({
      id: course._id,
      courseCode: course.courseCode,
      courseTitle: course.courseTitle,
      creditUnits: course.creditUnits,
      level: course.level,
      semester: course.semester,
      department: course.department,
      academicSession: course.academicSession,
      isActive: course.isActive,
      studentCount: course.students.length,
      lecturer: course.lecturer
        ? {
            id: course.lecturer._id,
            fullName: course.lecturer.user?.fullName,  // ✅ fullName
            email: course.lecturer.user?.email,
            staffId: course.lecturer.staffId,
          }
        : null,
      createdAt: course.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get single course with full details
// @route   GET /api/admin/courses/:id
// @access  Admin only
// ─────────────────────────────────────────────
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: "lecturer",
        populate: { path: "user", select: "fullName email" },
      })
      .populate({
        path: "students",
        populate: { path: "user", select: "fullName email" },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: course._id,
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        creditUnits: course.creditUnits,
        level: course.level,
        semester: course.semester,
        department: course.department,
        academicSession: course.academicSession,
        isActive: course.isActive,
        lecturer: course.lecturer
          ? {
              id: course.lecturer._id,
              fullName: course.lecturer.user?.fullName,
              email: course.lecturer.user?.email,
              staffId: course.lecturer.staffId,
            }
          : null,
        students: course.students.map((s) => ({
          id: s._id,
          fullName: s.user?.fullName,         // ✅ fullName
          email: s.user?.email,
          studentId: s.studentId,             // ✅ studentId
        })),
        studentCount: course.students.length,
      },
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Update course details
// @route   PUT /api/admin/courses/:id
// @access  Admin only
// ─────────────────────────────────────────────
const updateCourse = async (req, res) => {
  try {
    const {
      courseTitle,
      creditUnits,
      level,
      semester,
      department,
      academicSession,
      isActive,
    } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Validate level if provided
    if (level) {
      const validLevels = ["ND1", "ND2", "HND1", "HND2"];
      if (!validLevels.includes(level)) {
        return res.status(400).json({
          success: false,
          message: `Level must be one of: ${validLevels.join(", ")}`,
        });
      }
    }

    if (courseTitle) course.courseTitle = courseTitle;
    if (creditUnits) course.creditUnits = creditUnits;
    if (level) course.level = level;
    if (semester) course.semester = semester;
    if (department) course.department = department;
    if (academicSession) course.academicSession = academicSession;
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating course",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Deactivate course (soft delete)
// @route   DELETE /api/admin/courses/:id
// @access  Admin only
// ─────────────────────────────────────────────
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    course.isActive = false;
    await course.save();

    res.status(200).json({
      success: true,
      message: "Course deactivated successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting course",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Assign a lecturer to a course
// @route   POST /api/admin/courses/:id/assign-lecturer
// @access  Admin only
// Body:    { lecturerId: "..." }
// ─────────────────────────────────────────────
const assignLecturer = async (req, res) => {
  try {
    const { lecturerId } = req.body;
    const courseId = req.params.id;

    if (!lecturerId) {
      return res.status(400).json({
        success: false,
        message: "lecturerId is required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const lecturer = await Lecturer.findById(lecturerId).populate(
      "user",
      "fullName"
    );
    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: "Lecturer not found",
      });
    }

    // Remove course from previous lecturer's courses array if changing
    if (
      course.lecturer &&
      course.lecturer.toString() !== lecturerId
    ) {
      await Lecturer.findByIdAndUpdate(course.lecturer, {
        $pull: { courses: courseId },
      });
    }

    // Assign new lecturer to course
    course.lecturer = lecturerId;
    await course.save();

    // Add course to new lecturer's courses array
    await Lecturer.findByIdAndUpdate(lecturerId, {
      $addToSet: { courses: courseId },
    });

    // Return populated course data
    const updatedCourse = await Course.findById(courseId).populate({
      path: "lecturer",
      populate: { path: "user", select: "fullName email" },
    });

    res.status(200).json({
      success: true,
      message: `${lecturer.user.fullName} assigned to ${course.courseCode} successfully`,
      data: {
        courseId: updatedCourse._id,
        courseCode: updatedCourse.courseCode,
        lecturer: {
          id: updatedCourse.lecturer._id,
          fullName: updatedCourse.lecturer.user?.fullName,
          email: updatedCourse.lecturer.user?.email,
          staffId: updatedCourse.lecturer.staffId,
        },
      },
    });
  } catch (error) {
    console.error("Assign lecturer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while assigning lecturer",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Assign students to a course
// @route   POST /api/admin/courses/:id/assign-students
// @access  Admin only
// Body:    { studentIds: ["id1", "id2", ...] }
// ─────────────────────────────────────────────
const assignStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (
      !studentIds ||
      !Array.isArray(studentIds) ||
      studentIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "studentIds array is required and cannot be empty",
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more student IDs are invalid",
      });
    }

    // Add students to course (no duplicates)
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    );

    // IMPORTANT: Also add course to each student's courses array
    // This makes courseCount work on Students page
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { courses: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: `${students.length} student(s) assigned to ${course.courseCode}`,
      data: {
        courseId: course._id,
        courseCode: course.courseCode,
        totalStudents: updatedCourse.students.length,
        newlyAdded: students.length,
      },
    });
  } catch (error) {
    console.error("Assign students error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while assigning students",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Remove a student from a course
// @route   DELETE /api/admin/courses/:id/students/:studentId
// @access  Admin only
// ─────────────────────────────────────────────
const removeStudent = async (req, res) => {
  try {
    const { id: courseId, studentId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Remove student from course
    await Course.findByIdAndUpdate(courseId, {
      $pull: { students: studentId },
    });

    // Also remove course from student's courses array
    await Student.findByIdAndUpdate(studentId, {
      $pull: { courses: courseId },
    });

    res.status(200).json({
      success: true,
      message: "Student removed from course successfully",
    });
  } catch (error) {
    console.error("Remove student error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing student",
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignLecturer,
  assignStudents,
  removeStudent,
};