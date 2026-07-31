const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" })); // increased for base64 images
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve face-api model weights statically
app.use("/models", express.static(path.join(__dirname, "public/models")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/lecturer", require("./routes/lecturerRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ status: "QRoll API running" });
});

app.use(errorHandler);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join-session", (sessionId) => {
    socket.join(`session-${sessionId}`);
  });

  socket.on("leave-session", (sessionId) => {
    socket.leave(`session-${sessionId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`QRoll server running on port ${PORT}`);
});