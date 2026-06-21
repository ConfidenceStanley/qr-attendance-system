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

    // Validate required fields
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

    // Check course code not already used
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
    res.status(500).json({
      success: false,
      message: "Server error while creating course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
          select: "firstName lastName email",
        },
      })
      .sort({ courseCode: 1 }); // Sort alphabetically by code

    // Format with lecturer name and student count
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
            name: `${course.lecturer.user?.firstName} ${course.lecturer.user?.lastName}`,
            email: course.lecturer.user?.email,
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
        populate: { path: "user", select: "firstName lastName email" },
      })
      .populate({
        path: "students",
        populate: { path: "user", select: "firstName lastName email" },
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
              name: `${course.lecturer.user?.firstName} ${course.lecturer.user?.lastName}`,
              email: course.lecturer.user?.email,
            }
          : null,
        students: course.students.map((s) => ({
          id: s._id,
          name: `${s.user?.firstName} ${s.user?.lastName}`,
          email: s.user?.email,
          matricNumber: s.matricNumber,
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

    // Update only provided fields
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
// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Admin only
// Note:    Hard delete only if no attendance
//          sessions exist for this course
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

    // For now we soft delete (deactivate)
    // In Phase 3 we will check for active sessions
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

    if (!lecturerId) {
      return res.status(400).json({
        success: false,
        message: "Lecturer ID is required",
      });
    }

    // Verify course exists
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify lecturer exists
    const lecturer = await Lecturer.findById(lecturerId).populate(
      "user",
      "firstName lastName"
    );
    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: "Lecturer not found",
      });
    }

    // Assign lecturer to course
    course.lecturer = lecturerId;
    await course.save();

    res.status(200).json({
      success: true,
      message: `${lecturer.user.firstName} ${lecturer.user.lastName} 
                assigned to ${course.courseCode} successfully`,
      data: {
        courseId: course._id,
        courseCode: course.courseCode,
        lecturerId: lecturer._id,
        lecturerName: `${lecturer.user.firstName} ${lecturer.user.lastName}`,
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
// Note:    This ADDS students to existing list
//          Does not replace - use to add more
// ─────────────────────────────────────────────
const assignStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "studentIds array is required and cannot be empty",
      });
    }

    // Verify course exists
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify all student IDs exist
    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more student IDs are invalid",
      });
    }

    // Add students without duplicates
    // $addToSet only adds if not already in the array
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
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
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // $pull removes the specific studentId from array
    await Course.findByIdAndUpdate(req.params.id, {
      $pull: { students: req.params.studentId },
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