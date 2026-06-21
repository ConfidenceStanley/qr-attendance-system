const User = require("../models/User");
const Lecturer = require("../models/Lecturer");
const { sendLecturerWelcomeEmail } = require("../utils/emailService");

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
// @desc    Create new lecturer account
// @route   POST /api/admin/lecturers
// @access  Admin only
// ─────────────────────────────────────────────
const createLecturer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      staffId,       // matches your Lecturer.js
      department,
    } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !staffId) {
      return res.status(400).json({
        success: false,
        message: "fullName, email and staffId are required",
      });
    }

    // 2. Check email not already used
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // 3. Check staffId not already used
    const existingLecturer = await Lecturer.findOne({
      staffId: staffId.toUpperCase(),
    });
    if (existingLecturer) {
      return res.status(400).json({
        success: false,
        message: "A lecturer with this staff ID already exists",
      });
    }

    // 4. Generate random password
    const plainPassword = generatePassword();

    // 5. Create User account
    const user = await User.create({
      fullName,
      email,
      password: plainPassword,
      role: "lecturer",
    });

    // 6. Create Lecturer profile - only fields your model has
    const lecturer = await Lecturer.create({
      user: user._id,
      staffId,
      department: department || "Computer Science",
      courses: [],
    });

    // 7. Send welcome email (non-blocking)
    sendLecturerWelcomeEmail({
      fullName,
      email,
      password: plainPassword,
    });

    // 8. Return response
    res.status(201).json({
      success: true,
      message: "Lecturer account created successfully",
      data: {
        id: lecturer._id,
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        staffId: lecturer.staffId,
        department: lecturer.department,
        isActive: user.isActive,
        createdAt: lecturer.createdAt,
      },
    });
  } catch (error) {
    console.error("Create lecturer error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating lecturer",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all lecturers
// @route   GET /api/admin/lecturers
// @access  Admin only
// Supports: ?search=john  ?department=Computer Science
// ─────────────────────────────────────────────
const getAllLecturers = async (req, res) => {
  try {
    const { search, department } = req.query;

    // Build filter
    let lecturerFilter = {};
    if (department) lecturerFilter.department = department;

    // Fetch with user data
    const lecturers = await Lecturer.find(lecturerFilter)
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    // Apply search after populate
    let filtered = lecturers;
    if (search) {
      const query = search.toLowerCase();
      filtered = lecturers.filter((l) => {
        const name = l.user?.fullName?.toLowerCase() || "";
        const email = l.user?.email?.toLowerCase() || "";
        const sid = l.staffId?.toLowerCase() || "";

        return (
          name.includes(query) ||
          email.includes(query) ||
          sid.includes(query)
        );
      });
    }

    // Format response
    const formatted = filtered.map((lecturer) => ({
      id: lecturer._id,
      userId: lecturer.user?._id,
      fullName: lecturer.user?.fullName,
      email: lecturer.user?.email,
      isActive: lecturer.user?.isActive,
      staffId: lecturer.staffId,
      department: lecturer.department,
      courseCount: lecturer.courses?.length || 0,
      createdAt: lecturer.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Get lecturers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching lecturers",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get single lecturer by ID
// @route   GET /api/admin/lecturers/:id
// @access  Admin only
// ─────────────────────────────────────────────
const getLecturerById = async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id)
      .populate("user", "-password")
      .populate("courses", "courseCode courseTitle level semester");

    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: "Lecturer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: lecturer._id,
        userId: lecturer.user?._id,
        fullName: lecturer.user?.fullName,
        email: lecturer.user?.email,
        isActive: lecturer.user?.isActive,
        staffId: lecturer.staffId,
        department: lecturer.department,
        courses: lecturer.courses,
        createdAt: lecturer.createdAt,
      },
    });
  } catch (error) {
    console.error("Get lecturer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching lecturer",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Update lecturer details
// @route   PUT /api/admin/lecturers/:id
// @access  Admin only
// ─────────────────────────────────────────────
const updateLecturer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      department,
      isActive,
    } = req.body;

    // Find lecturer profile
    const lecturer = await Lecturer.findById(req.params.id);
    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: "Lecturer not found",
      });
    }

    // Find linked user
    const user = await User.findById(lecturer.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Check email not taken by someone else
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

    // Update User document
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    // Update Lecturer document
    if (department) lecturer.department = department;
    await lecturer.save();

    res.status(200).json({
      success: true,
      message: "Lecturer updated successfully",
      data: {
        id: lecturer._id,
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        staffId: lecturer.staffId,
        department: lecturer.department,
      },
    });
  } catch (error) {
    console.error("Update lecturer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating lecturer",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Deactivate lecturer (soft delete)
// @route   DELETE /api/admin/lecturers/:id
// @access  Admin only
// ─────────────────────────────────────────────
const deleteLecturer = async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id);
    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: "Lecturer not found",
      });
    }

    // Soft delete - preserves all history
    await User.findByIdAndUpdate(lecturer.user, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Lecturer account deactivated. All data preserved.",
    });
  } catch (error) {
    console.error("Delete lecturer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deactivating lecturer",
    });
  }
};

module.exports = {
  createLecturer,
  getAllLecturers,
  getLecturerById,
  updateLecturer,
  deleteLecturer,
};