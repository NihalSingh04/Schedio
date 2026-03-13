import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./shared/layout/AppShell.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import StudentTimetablePage from "./pages/student/StudentTimetablePage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import FacultyDashboard from "./pages/faculty/FacultyDashboard.jsx";
import ProtectedRoute from "./shared/auth/ProtectedRoute.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
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