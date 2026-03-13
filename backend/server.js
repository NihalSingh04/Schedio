import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import timetableRoutes from "./routes/timetableRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";

import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { generateTimetableJob } from "./inngest/function/generateTimetable.js";

dotenv.config();

export let io;

const startServer = async () => {
  try {

    await connectDB();

    const app = express();

    const server = http.createServer(app);

    io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("⚡ Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    app.use(express.json());

    app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
      })
    );

    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        message: "CP-SAT Timetable Generator is running",
      });
    });

    /* ===============================
       INNGEST ROUTE
    =============================== */

    app.use(
      "/api/inngest",
      serve({
        client: inngest,
        functions: [generateTimetableJob],
      })
    );

    app.use("/api/test", testRoutes);

    /* ===============================
       APP ROUTES
    =============================== */

    app.use("/api/auth", authRoutes);
    app.use("/api/timetable", timetableRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/faculty", facultyRoutes);

    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });

    const PORT = process.env.PORT || 5001;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`⚡ Inngest endpoint: http://localhost:${PORT}/api/inngest`);
    });

  } catch (error) {
    console.error("Server start failed:", error);
    process.exit(1);
  }
};

startServer();