const User = require("../models/User");
const Student = require("../models/Student");
const Lecturer = require("../models/Lecturer");
const generateToken = require("../utils/generateToken");

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide email and password",
//       });
//     }

//     const user = await User.findOne({ email }).select("+password");

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     if (!user.isActive) {
//       return res.status(401).json({
//         success: false,
//         message: "Your account has been deactivated. Contact admin",
//       });
//     }

//     const isMatch = await user.matchPassword(password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     user.lastLogin = new Date();
//     await user.save({ validateBeforeSave: false });

//     let profileData = null;

//     if (user.role === "student") {
//       profileData = await Student.findOne({ user: user._id }).populate(
//         "courses",
//         "courseCode courseTitle"
//       );
//     } else if (user.role === "lecturer") {
//       profileData = await Lecturer.findOne({ user: user._id }).populate(
//         "courses",
//         "courseCode courseTitle"
//       );
//     }

//     const token = generateToken(user._id, user.role);

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//         profile: profileData,
//       },
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

const login = async (req, res, next) => {
  try {
    console.log("─── LOGIN ATTEMPT ───");
    console.log("Body received:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    console.log("User found:", user ? "YES" : "NO");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("User role:", user.role);
    console.log("User active:", user.isActive);

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated. Contact admin",
      });
    }

    const isMatch = await user.matchPassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    console.log("Last login updated");

    let profileData = null;

    if (user.role === "student") {
      console.log("Fetching student profile...");
      profileData = await Student.findOne({ user: user._id }).populate(
        "courses",
        "courseCode courseTitle"
      );
      console.log("Student profile found:", profileData ? "YES" : "NO");
    } else if (user.role === "lecturer") {
      console.log("Fetching lecturer profile...");
      profileData = await Lecturer.findOne({ user: user._id }).populate(
        "courses",
        "courseCode courseTitle"
      );
      console.log("Lecturer profile found:", profileData ? "YES" : "NO");
    }

    const token = generateToken(user._id, user.role);
    console.log("Token generated");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profile: profileData,
      },
    });
  } catch (error) {
    // LOG THE FULL ERROR HERE
    console.error("─── LOGIN ERROR ───");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full stack:", error.stack);
    console.error("──────────────────");
    return next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profileData = null;

    if (user.role === "student") {
      profileData = await Student.findOne({ user: user._id }).populate(
        "courses",
        "courseCode courseTitle"
      );
    } else if (user.role === "lecturer") {
      profileData = await Lecturer.findOne({ user: user._id }).populate(
        "courses",
        "courseCode courseTitle"
      );
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        profile: profileData,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { login, getMe, changePassword };