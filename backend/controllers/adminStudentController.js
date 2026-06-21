const User = require("../models/User");
const Student = require("../models/Student");
const { sendStudentWelcomeEmail } = require("../utils/emailService");

// ─────────────────────────────────────────────
// Helper: Generate random password
// ─────────────────────────────────────────────
const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const nums = "0123456789";
  const special = "@#$";
  const randomChar = (str) => str[Math.floor(Math.random() * str.length)];

  return (
    randomChar(chars).toUpperCase() +
    randomChar(chars) +
    randomChar(chars) +
    randomChar(special) +
    randomChar(nums) +
    randomChar(nums) +
    randomChar(nums) +
    randomChar(nums)
  );
};

// ─────────────────────────────────────────────
// @desc    Create new student account
// @route   POST /api/admin/students
// @access  Admin only
// ─────────────────────────────────────────────
const createStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      studentId,
      level,
      department,
      guardianName,
      guardianPhone,
      guardianEmail,
      guardianRelationship,
    } = req.body;

    // 1. Validate required fields
    if (
      !fullName ||
      !email ||
      !studentId ||
      !level ||
      !guardianName ||
      !guardianPhone ||
      !guardianEmail ||
      !guardianRelationship
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields required: fullName, email, studentId, level, " +
          "and all guardian fields",
      });
    }

    // 2. Validate level matches your Student model enum
    const validLevels = ["ND1", "ND2", "HND1", "HND2"];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: `Level must be one of: ${validLevels.join(", ")}`,
      });
    }

    // 3. Check email not already used
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // 4. Check studentId not already used
    const existingStudent = await Student.findOne({
      studentId: studentId.toUpperCase(),
    });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "A student with this ID already exists",
      });
    }

    // 5. Generate random password
    const plainPassword = generatePassword();

    // 6. Create User account using fullName (matches your User.js)
    const user = await User.create({
      fullName,
      email,
      password: plainPassword,
      role: "student",
    });

    // 7. Create Student profile
    const student = await Student.create({
      user: user._id,
      studentId,
      level,
      department: department || "Computer Science",
      courses: [],
      guardian: {
        name: guardianName,
        email: guardianEmail,
        phone: guardianPhone,
        relationship: guardianRelationship,
      },
    });

    // 8. Send welcome email (non-blocking - wont delay response)
    sendStudentWelcomeEmail({
      fullName,
      email,
      studentId,
      password: plainPassword,
    });

    // 9. Return created student data
    res.status(201).json({
      success: true,
      message: "Student account created successfully",
      data: {
        id: student._id,
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: student.studentId,
        level: student.level,
        department: student.department,
        guardian: student.guardian,
        isActive: user.isActive,
        createdAt: student.createdAt,
      },
    });
  } catch (error) {
    console.error("Create student error:", error);

    // Handle mongoose duplicate key error gracefully
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating student",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all students
// @route   GET /api/admin/students
// @access  Admin only
// Supports: ?search=alice  ?level=HND1
// ─────────────────────────────────────────────
const getAllStudents = async (req, res) => {
  try {
    const { search, level } = req.query;

    // Build student-level filter
    let studentFilter = {};
    if (level) studentFilter.level = level;

    // Fetch all (or level-filtered) students with user data
    const students = await Student.find(studentFilter)
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    // Apply search filter after populate
    // because fullName and email are on the User document
    let filtered = students;
    if (search) {
      const query = search.toLowerCase();
      filtered = students.filter((s) => {
        const name = s.user?.fullName?.toLowerCase() || "";
        const email = s.user?.email?.toLowerCase() || "";
        const sid = s.studentId?.toLowerCase() || "";

        return (
          name.includes(query) ||
          email.includes(query) ||
          sid.includes(query)
        );
      });
    }

    // Format into flat clean response
    const formatted = filtered.map((student) => ({
      id: student._id,
      userId: student.user?._id,
      fullName: student.user?.fullName,
      email: student.user?.email,
      isActive: student.user?.isActive,
      studentId: student.studentId,
      level: student.level,
      department: student.department,
      guardian: student.guardian,
      courseCount: student.courses?.length || 0,
      createdAt: student.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching students",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get single student by ID
// @route   GET /api/admin/students/:id
// @access  Admin only
// ─────────────────────────────────────────────
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "-password")
      .populate("courses", "courseCode courseTitle level semester");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: student._id,
        userId: student.user?._id,
        fullName: student.user?.fullName,
        email: student.user?.email,
        isActive: student.user?.isActive,
        studentId: student.studentId,
        level: student.level,
        department: student.department,
        guardian: student.guardian,
        courses: student.courses,
        createdAt: student.createdAt,
      },
    });
  } catch (error) {
    console.error("Get student error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Update student details
// @route   PUT /api/admin/students/:id
// @access  Admin only
// ─────────────────────────────────────────────
const updateStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      level,
      department,
      isActive,
      guardianName,
      guardianPhone,
      guardianEmail,
      guardianRelationship,
    } = req.body;

    // Find student profile
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Find linked user account
    const user = await User.findById(student.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Check new email is not taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another account",
        });
      }
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

    // Update User document fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    // Update Student document fields
    if (level) student.level = level;
    if (department) student.department = department;

    // Update only the guardian fields that were provided
    if (guardianName) student.guardian.name = guardianName;
    if (guardianPhone) student.guardian.phone = guardianPhone;
    if (guardianEmail) student.guardian.email = guardianEmail;
    if (guardianRelationship)
      student.guardian.relationship = guardianRelationship;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: {
        id: student._id,
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        studentId: student.studentId,
        level: student.level,
        department: student.department,
        guardian: student.guardian,
      },
    });
  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating student",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Deactivate student (soft delete)
// @route   DELETE /api/admin/students/:id
// @access  Admin only
// ─────────────────────────────────────────────
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Soft delete - keeps attendance history intact
    await User.findByIdAndUpdate(student.user, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Student account deactivated. All data preserved.",
    });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deactivating student",
    });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};