const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");             // NEW
const { Server } = require("socket.io"); // NEW
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/lecturer", require("./routes/lecturerRoutes")); // NEW
app.use("/api/student", require("./routes/studentRoutes"));   // NEW

app.get("/api/health", (req, res) => {
  res.json({ status: "QRoll API running" });
});

// ── Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ── Socket.io Setup ─────────────────────────────────────
// Wrap express app in http server so socket.io can share the port
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Make io accessible inside controllers via req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Lecturer joins a room specific to their session
  // So only that lecturer receives scan events
  socket.on("join-session", (sessionId) => {
    socket.join(`session-${sessionId}`);
    console.log(`Socket ${socket.id} joined session-${sessionId}`);
  });

  // Lecturer leaves when they close the QR page
  socket.on("leave-session", (sessionId) => {
    socket.leave(`session-${sessionId}`);
    console.log(`Socket ${socket.id} left session-${sessionId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`QRoll server running on port ${PORT}`);
});