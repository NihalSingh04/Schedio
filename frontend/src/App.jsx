import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./shared/layout/AppShell.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import StudentTimetablePage from "./pages/student/StudentTimetablePage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import FacultyDashboard from "./pages/faculty/FacultyDashboard.jsx";
import ProtectedRoute from "./shared/auth/ProtectedRoute.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import { socket } from "./socket"; // ✅ ADD

export default function App() {

  useEffect(() => {

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("timetableProgress", (data) => {
      console.log("📡 Progress:", data);
    });

    socket.on("timetableGenerated", (data) => {
      console.log("🎉 Timetable Generated:", data);
    });

    return () => {
      socket.off("connect");
      socket.off("timetableProgress");
      socket.off("timetableGenerated");
    };

  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/student" replace />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/student" element={<StudentTimetablePage />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty/*"
            element={
              <ProtectedRoute roles={["faculty", "admin"]}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}