const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");

// ─────────────────────────────────────────
// Generate random secure password
// ─────────────────────────────────────────
const generatePassword = (length = 10) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// ─────────────────────────────────────────
// POST /api/admin/users/:userId/reset-password
// Admin resets any user's password
// ─────────────────────────────────────────
const resetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin should not reset another admin's password
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin passwords cannot be reset this way",
      });
    }

    // Generate new password
    const newPassword = generatePassword(10);

    // Save it (mongoose pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    // Try to send email
    let emailSent = false;
    try {
      await sendEmail({
        to: user.email,
        subject: "QRoll — Your Password Has Been Reset",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #4f46e5; color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">QRoll Password Reset</h1>
            </div>
            <div style="background: #fafafa; padding: 30px; border-radius: 0 0 12px 12px;">
              <p style="font-size: 15px; color: #18181b;">Hello <strong>${user.fullName}</strong>,</p>
              <p style="font-size: 14px; color: #71717a; line-height: 1.6;">
                Your QRoll account password has been reset by an administrator. 
                Please use the new password below to login.
              </p>
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 24px 0; border: 2px dashed #4f46e5;">
                <p style="margin: 0 0 6px; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">
                  New Password
                </p>
                <p style="margin: 0; font-size: 20px; font-weight: 700; color: #4f46e5; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                  ${newPassword}
                </p>
              </div>
              <p style="font-size: 13px; color: #71717a; line-height: 1.6;">
                For your security, please change this password after logging in.
              </p>
              <p style="font-size: 12px; color: #a1a1aa; margin-top: 30px; text-align: center;">
                QRoll — Smart Attendance System
              </p>
            </div>
          </div>
        `,
      });
      emailSent = true;
    } catch (emailError) {
      console.warn("Email failed:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: `Password reset successfully${emailSent ? " and emailed to user" : ""}`,
      newPassword,
      emailSent,
      user: {
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { resetUserPassword };