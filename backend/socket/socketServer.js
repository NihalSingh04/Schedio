import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://schedio-sable.vercel.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },

    // ✅ allow both (IMPORTANT)
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
    });

    socket.on("error", (err) => {
      console.error("🔥 Socket error:", err);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("⚠️ IO not initialized");
    return null;
  }
  return io;
};