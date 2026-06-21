const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─────────────────────────────────────────────
// Send Welcome Email to New Lecturer
// ─────────────────────────────────────────────
const sendLecturerWelcomeEmail = async (lecturerData) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("📧 Email skipped - no credentials set");
    return;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"QRoll System" <${process.env.EMAIL_USER}>`,
    to: lecturerData.email,
    subject: "Welcome to QRoll - Your Lecturer Account",
    html: `
      <div style="font-family: Arial, sans-serif; 
                  max-width: 600px; margin: 0 auto;">

        <div style="background: #4f46e5; 
                    padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">QRoll</h1>
          <p style="color: #c7d2fe; margin: 5px 0 0;">
            Attendance Monitoring System
          </p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #18181b;">
            Welcome, ${lecturerData.fullName}!
          </h2>
          <p style="color: #71717a;">
            Your lecturer account has been created on QRoll. 
            Here are your login credentials:
          </p>

          <div style="background: #fafafa; 
                      border: 1px solid #e4e4e7;
                      border-radius: 8px; 
                      padding: 20px; 
                      margin: 20px 0;">
            <p style="margin: 0 0 10px;">
              <strong>Email:</strong> ${lecturerData.email}
            </p>
            <p style="margin: 0 0 10px;">
              <strong>Password:</strong> ${lecturerData.password}
            </p>
            <p style="margin: 0; color: #71717a; font-size: 14px;">
              Please change your password after first login.
            </p>
          </div>

          <p style="color: #71717a;">
            Login at:
            <a href="${process.env.FRONTEND_URL}" 
               style="color: #4f46e5;">
              ${process.env.FRONTEND_URL}
            </a>
          </p>
        </div>

        <div style="padding: 20px; text-align: center;
                    color: #71717a; font-size: 12px;">
          <p>This is an automated message. Please do not reply.</p>
        </div>

      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Lecturer welcome email sent to:", lecturerData.email);
  } catch (error) {
    console.error("📧 Email send failed:", error.message);
  }
};

// ─────────────────────────────────────────────
// Send Welcome Email to New Student
// ─────────────────────────────────────────────
const sendStudentWelcomeEmail = async (studentData) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("📧 Email skipped - no credentials set");
    return;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"QRoll System" <${process.env.EMAIL_USER}>`,
    to: studentData.email,
    subject: "Welcome to QRoll - Your Student Account",
    html: `
      <div style="font-family: Arial, sans-serif; 
                  max-width: 600px; margin: 0 auto;">

        <div style="background: #4f46e5; 
                    padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">QRoll</h1>
          <p style="color: #c7d2fe; margin: 5px 0 0;">
            Attendance Monitoring System
          </p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #18181b;">
            Welcome, ${studentData.fullName}!
          </h2>
          <p style="color: #71717a;">
            Your student account has been created on QRoll.
            Download the QRoll mobile app and login with 
            these credentials:
          </p>

          <div style="background: #fafafa; 
                      border: 1px solid #e4e4e7;
                      border-radius: 8px; 
                      padding: 20px; 
                      margin: 20px 0;">
            <p style="margin: 0 0 10px;">
              <strong>Email:</strong> ${studentData.email}
            </p>
            <p style="margin: 0 0 10px;">
              <strong>Student ID:</strong> ${studentData.studentId}
            </p>
            <p style="margin: 0;">
              <strong>Password:</strong> ${studentData.password}
            </p>
          </div>

          <p style="color: #71717a; font-size: 14px;">
            Please change your password after first login.
          </p>
        </div>

        <div style="padding: 20px; text-align: center;
                    color: #71717a; font-size: 12px;">
          <p>This is an automated message. Please do not reply.</p>
        </div>

      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Student welcome email sent to:", studentData.email);
  } catch (error) {
    console.error("📧 Email send failed:", error.message);
  }
};

// ─────────────────────────────────────────────
// Send Absence Alert to Guardian
// Used in Phase 5 when session closes
// ─────────────────────────────────────────────
const sendGuardianAbsenceEmail = async (guardianData) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("📧 Email skipped - no credentials set");
    return;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"QRoll System" <${process.env.EMAIL_USER}>`,
    to: guardianData.guardianEmail,
    subject: `Absence Alert - ${guardianData.studentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; 
                  max-width: 600px; margin: 0 auto;">

        <div style="background: #f43f5e; 
                    padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">QRoll</h1>
          <p style="color: #fecdd3; margin: 5px 0 0;">
            Attendance Alert
          </p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #18181b;">
            Dear ${guardianData.guardianName},
          </h2>
          <p style="color: #71717a;">
            This is to inform you that your ward was absent 
            from the following class:
          </p>

          <div style="background: #fafafa; 
                      border: 1px solid #e4e4e7;
                      border-radius: 8px; 
                      padding: 20px; 
                      margin: 20px 0;">
            <p style="margin: 0 0 10px;">
              <strong>Student:</strong> ${guardianData.studentName}
            </p>
            <p style="margin: 0 0 10px;">
              <strong>Course:</strong> ${guardianData.courseTitle}
            </p>
            <p style="margin: 0 0 10px;">
              <strong>Date:</strong> ${guardianData.date}
            </p>
            <p style="margin: 0;">
              <strong>Attendance:</strong> 
              ${guardianData.attendancePercent}% overall
            </p>
          </div>
        </div>

        <div style="padding: 20px; text-align: center;
                    color: #71717a; font-size: 12px;">
          <p>This is an automated message. Please do not reply.</p>
        </div>

      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      "📧 Guardian absence email sent to:",
      guardianData.guardianEmail
    );
  } catch (error) {
    console.error("📧 Guardian email failed:", error.message);
  }
};

module.exports = {
  sendLecturerWelcomeEmail,
  sendStudentWelcomeEmail,
  sendGuardianAbsenceEmail,
};