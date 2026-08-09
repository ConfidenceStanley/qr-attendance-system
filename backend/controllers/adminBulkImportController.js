const multer = require("multer");
const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const Lecturer = require("../models/Lecturer");
const path = require("path");

// ─────────────────────────────────────────────
// BULK PASSWORD STRATEGY
// Fixed password for all bulk imports.
// No emails sent — admin announces in class.
// Gmail SMTP cannot handle 100-1000 emails.
// Single registration still uses email + random password.
// ─────────────────────────────────────────────
const BULK_DEFAULT_PASSWORD = "QRoll@1234";

// ─────────────────────────────────────────────
// MULTER CONFIGURATION
// Memory storage — no disk writes needed
// ─────────────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = [".csv", ".xlsx", ".xls"];

  if (allowed.includes(file.mimetype) || allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only CSV and Excel files are accepted."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ─────────────────────────────────────────────
// UTILITY — Parse uploaded file to row array
// ─────────────────────────────────────────────
const parseFile = (buffer, originalname) => {
  const workbook = xlsx.read(buffer, {
    type: "buffer",
    raw: false,
    defval: "",
  });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = xlsx.utils.sheet_to_json(sheet, {
    header: 0,
    defval: "",
    blankrows: false,
  });

  return rows;
};

// ─────────────────────────────────────────────
// UTILITY — Normalise header keys
// ─────────────────────────────────────────────
const normaliseRow = (row) => {
  const normalised = {};
  for (const key of Object.keys(row)) {
    const clean = key
      .toLowerCase()
      .replace(/[\s_\-]/g, "");
    normalised[clean] = String(row[key]).trim();
  }
  return normalised;
};

// ─────────────────────────────────────────────
// UTILITY — Validate email format
// ─────────────────────────────────────────────
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ─────────────────────────────────────────────
// Valid levels — must match Student model enum
// ─────────────────────────────────────────────
const VALID_LEVELS = ["ND1", "ND2", "HND1", "HND2"];

// ─────────────────────────────────────────────
// CONTROLLER — Bulk Import Students
// POST /api/admin/bulk-import/students
// ─────────────────────────────────────────────
const bulkImportStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const rows = parseFile(req.file.buffer, req.file.originalname);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "File is empty or has no data rows." });
    }

    if (rows.length > 500) {
      return res.status(400).json({
        message:
          "Maximum 500 students per import. Split your file into batches.",
      });
    }

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      imported: [],
    };

    // ── FIX: Hash once here, then use updateOne/save bypass ──
    // We hash manually and use updateOne to bypass the pre-save hook
    // This prevents double-hashing (hook would hash an already-hashed value)
    const hashedPassword = await bcrypt.hash(BULK_DEFAULT_PASSWORD, 12);

    // Sanity-check our hash before touching the DB
    const sanityOk = await bcrypt.compare(BULK_DEFAULT_PASSWORD, hashedPassword);
    if (!sanityOk) {
      return res
        .status(500)
        .json({ message: "Password hashing sanity check failed. Aborting." });
    }

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const raw = normaliseRow(rows[i]);

      // ── Map flexible column names ──
      const fullName =
        raw.fullname || raw.name || raw.studentname || raw.student || "";
      const email = raw.email || raw.emailaddress || raw.mail || "";
      const studentId =
        raw.studentid ||
        raw.id ||
        raw.matricnumber ||
        raw.regnumber ||
        raw.matric ||
        "";
      const level = raw.level || raw.year || raw.studylevel || "";
      const department = raw.department || raw.dept || raw.faculty || "";
      const guardianName =
        raw.guardianname ||
        raw.parentname ||
        raw.guardian ||
        raw.parent ||
        "";
      const guardianEmail =
        raw.guardianemail || raw.parentemail || raw.guardiansmail || "";
      const guardianPhone =
        raw.guardianphone ||
        raw.parentphone ||
        raw.guardiancontact ||
        raw.parentcontact ||
        "";
      const guardianRelationship =
        raw.guardianrelationship ||
        raw.relationship ||
        raw.parentrelationship ||
        "Guardian";

      // ── Validate required fields ──
      const rowErrors = [];
      if (!fullName) rowErrors.push("fullName is required");
      if (!email) rowErrors.push("email is required");
      if (email && !isValidEmail(email)) rowErrors.push("email format is invalid");
      if (!studentId) rowErrors.push("studentId is required");
      if (!level) rowErrors.push("level is required");
      if (level && !VALID_LEVELS.includes(level)) {
        rowErrors.push(
          `level must be one of: ND1, ND2, HND1, HND2 — got "${level}"`
        );
      }
      if (!department) rowErrors.push("department is required");

      if (rowErrors.length > 0) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          data: { fullName, email, studentId },
          reasons: rowErrors,
        });
        continue;
      }

      // ── Duplicate check ──
      try {
        const existingUser = await User.findOne({
          email: email.toLowerCase(),
        });
        const existingStudent = await Student.findOne({ studentId });

        if (existingUser || existingStudent) {
          results.skipped++;
          results.errors.push({
            row: rowNum,
            data: { fullName, email, studentId },
            reasons: [
              existingUser
                ? "Email already registered"
                : "Student ID already exists",
            ],
            skipped: true,
          });
          continue;
        }

        // ── FIX: Use new User() + updateOne to bypass pre-save hook ──
        // Step 1: Create the user document with a dummy password
        //         (pre-save hook will hash it, but we immediately overwrite)
        // Step 2: Use updateOne with $set to store OUR correct hash directly
        //
        // WHY: User.create({ password: hashedPassword }) triggers pre-save
        //      which hashes the already-hashed value → double hash → login fails
        //
        const user = await User.create({
          fullName,
          email: email.toLowerCase(),
          password: BULK_DEFAULT_PASSWORD, // ← plain text — hook hashes it ONCE ✓
          role: "student",
        });

        // ── Create Student profile ──
        try {
          await Student.create({
            user: user._id,
            studentId,
            level,
            department,
            guardian: {
              name: guardianName || "",
              email: guardianEmail || "",
              phone: guardianPhone || "",
              relationship: guardianRelationship || "Guardian",
            },
            enrolledCourses: [],
          });
        } catch (studentErr) {
          // Rollback user so this row can be retried cleanly
          await User.findByIdAndDelete(user._id);
          throw studentErr;
        }

        console.log(
          `[BulkImport] Created student: ${email} | Password: ${BULK_DEFAULT_PASSWORD}`
        );

        results.success++;
        results.imported.push({
          row: rowNum,
          fullName,
          email: email.toLowerCase(),
          studentId,
          level,
          department,
        });
      } catch (dbErr) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          data: { fullName, email, studentId },
          reasons: [`Database error: ${dbErr.message}`],
        });
      }
    } // ← for loop ends here

    return res.status(200).json({
      message: `Import complete. ${results.success} created, ${results.skipped} skipped, ${results.failed} failed.`,
      defaultPassword: BULK_DEFAULT_PASSWORD,
      note: "All imported students can log in with the default password above.",
      success: results.success,
      failed: results.failed,
      skipped: results.skipped,
      errors: results.errors,
      imported: results.imported,
    });
  } catch (err) {
    console.error("[BulkImport] Students error:", err);
    return res
      .status(500)
      .json({ message: "Server error during import. Check server logs." });
  }
};

// ─────────────────────────────────────────────
// CONTROLLER — Bulk Import Lecturers
// POST /api/admin/bulk-import/lecturers
// ─────────────────────────────────────────────
const bulkImportLecturers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const rows = parseFile(req.file.buffer, req.file.originalname);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "File is empty or has no data rows." });
    }

    if (rows.length > 200) {
      return res
        .status(400)
        .json({ message: "Maximum 200 lecturers per import." });
    }

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      imported: [],
    };

    // ── FIX: Hash once, sanity-check, then let hook handle it ──
    const hashedPassword = await bcrypt.hash(BULK_DEFAULT_PASSWORD, 12);
    const sanityOk = await bcrypt.compare(BULK_DEFAULT_PASSWORD, hashedPassword);
    if (!sanityOk) {
      return res
        .status(500)
        .json({ message: "Password hashing sanity check failed. Aborting." });
    }

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const raw = normaliseRow(rows[i]);

      const fullName =
        raw.fullname || raw.name || raw.lecturername || raw.lecturer || "";
      const email = raw.email || raw.emailaddress || raw.mail || "";
      const staffId =
        raw.staffid || raw.id || raw.employeeid || raw.staffnumber || "";
      const department = raw.department || raw.dept || raw.faculty || "";

      // ── Validate required fields ──
      const rowErrors = [];
      if (!fullName) rowErrors.push("fullName is required");
      if (!email) rowErrors.push("email is required");
      if (email && !isValidEmail(email)) rowErrors.push("email format is invalid");
      if (!staffId) rowErrors.push("staffId is required");
      if (!department) rowErrors.push("department is required");

      if (rowErrors.length > 0) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          data: { fullName, email, staffId },
          reasons: rowErrors,
        });
        continue;
      }

      // ── Duplicate check ──
      try {
        const existingUser = await User.findOne({
          email: email.toLowerCase(),
        });
        const existingLecturer = await Lecturer.findOne({ staffId });

        if (existingUser || existingLecturer) {
          results.skipped++;
          results.errors.push({
            row: rowNum,
            data: { fullName, email, staffId },
            reasons: [
              existingUser
                ? "Email already registered"
                : "Staff ID already exists",
            ],
            skipped: true,
          });
          continue;
        }

        // ── FIX: Pass plain text password — pre-save hook hashes it ONCE ──
        // DO NOT pre-hash and pass hashedPassword here.
        // User.create() triggers pre-save → hashes plain text → correct single hash stored ✓
        const user = await User.create({
          fullName,
          email: email.toLowerCase(),
          password: BULK_DEFAULT_PASSWORD, // ← plain text — hook hashes it ONCE ✓
          role: "lecturer",
        });

        // ── Create Lecturer profile ──
        try {
          await Lecturer.create({
            user: user._id,
            staffId,
            department,
            assignedCourses: [],
          });
        } catch (lecturerErr) {
          await User.findByIdAndDelete(user._id);
          throw lecturerErr;
        }

        console.log(
          `[BulkImport] Created lecturer: ${email} | Password: ${BULK_DEFAULT_PASSWORD}`
        );

        results.success++;
        results.imported.push({
          row: rowNum,
          fullName,
          email: email.toLowerCase(),
          staffId,
          department,
        });
      } catch (dbErr) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          data: { fullName, email, staffId },
          reasons: [`Database error: ${dbErr.message}`],
        });
      }
    } // ← for loop ends here

    return res.status(200).json({
      message: `Import complete. ${results.success} created, ${results.skipped} skipped, ${results.failed} failed.`,
      defaultPassword: BULK_DEFAULT_PASSWORD,
      note: "All imported lecturers can log in with the default password above.",
      success: results.success,
      failed: results.failed,
      skipped: results.skipped,
      errors: results.errors,
      imported: results.imported,
    });
  } catch (err) {
    console.error("[BulkImport] Lecturers error:", err);
    return res
      .status(500)
      .json({ message: "Server error during import. Check server logs." });
  }
};

// ─────────────────────────────────────────────
// CONTROLLER — Download CSV Template
// GET /api/admin/bulk-import/template/students
// GET /api/admin/bulk-import/template/lecturers
// ─────────────────────────────────────────────
const downloadTemplate = (req, res) => {
  const { type } = req.params;

  let headers = [];
  let sampleRow = [];
  let filename = "";

  if (type === "students") {
    headers = [
      "fullName",
      "email",
      "studentId",
      "level",
      "department",
      "guardianName",
      "guardianEmail",
      "guardianPhone",
      "guardianRelationship",
    ];
    sampleRow = [
      "John Doe",
      "john.doe@university.edu",
      "STU2024001",
      "HND1",
      "Computer Science",
      "Jane Doe",
      "jane.doe@email.com",
      "+2348012345678",
      "Mother",
    ];
    filename = "qrroll_students_template.csv";
  } else if (type === "lecturers") {
    headers = ["fullName", "email", "staffId", "department"];
    sampleRow = [
      "Dr. Ada Okonkwo",
      "ada.okonkwo@university.edu",
      "STAFF001",
      "Computer Science",
    ];
    filename = "qrroll_lecturers_template.csv";
  } else {
    return res.status(400).json({
      message: "Invalid template type. Use 'students' or 'lecturers'.",
    });
  }

  const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csvContent);
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  upload,
  bulkImportStudents,
  bulkImportLecturers,
  downloadTemplate,
};