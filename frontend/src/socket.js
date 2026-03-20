import { io } from "socket.io-client";

const SOCKET_URL = "https://schedio-backend.onrender.com";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // ✅ FIXED
});

// ✅ DEBUG (MUST HAVE)
socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connect Error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("⚠️ Disconnected:", reason);
});