
import React from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import AdminTeachersPage from "./AdminTeachersPage.jsx";
import AdminSubjectsPage from "./AdminSubjectsPage.jsx";
import AdminRoomsPage from "./AdminRoomsPage.jsx";
import AdminConstraintsPage from "./AdminConstraintsPage.jsx";
import AdminGenerateTimetablePage from "./AdminGenerateTimetablePage.jsx";
import AdminEditEntryPage from "./AdminEditEntryPage.jsx";
import AdminTimetableLookupPage from "./AdminTimetableLookupPage.jsx";

const NAV_ITEMS = [
  {
    to: "",
    label: "Lookup Timetable",
    description: "Search and view generated timetables",
  },
  {
    to: "generate",
    label: "Generate",
    description: "Create timetable using solver",
  },
  {
    to: "teachers",
    label: "Teachers",
    description: "Manage faculty and assignments",
  },
  {
    to: "subjects",
    label: "Subjects",
    description: "Add and organize subjects",
  },
  {
    to: "rooms",
    label: "Rooms",
    description: "Manage classrooms and labs",
  },
  {
    to: "constraints",
    label: "Constraints",
    description: "Set timetable rules and limits",
  },
];

function Tab({ to, label, description }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "group min-w-[160px] rounded-2xl border px-4 py-3 text-left transition-all duration-200",
          isActive
            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
        ].join(" ")
      }
    >
      <div className="text-sm font-semibold">{label}</div>
      <div
        className={[
          "mt-1 text-xs",
          "group-[.active]:text-slate-200",
          "text-slate-500",
        ].join(" ")}
      >
        {description}
      </div>
    </NavLink>
  );
}

function DashboardHeader() {
  const location = useLocation();

  const activeItem =
    NAV_ITEMS.find((item) => {
      if (item.to === "") return location.pathname.endsWith("/admin") || location.pathname.endsWith("/admin/");
      return location.pathname.includes(`/admin/${item.to}`);
    }) || NAV_ITEMS[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-slate-100">
            ADMIN PANEL
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
            Timetable Management Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">
            Manage timetable data, maintain resources, apply scheduling constraints,
            and generate class schedules from one place.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-200">
            Active Module
          </div>
          <div className="mt-1 text-lg font-semibold">{activeItem.label}</div>
          <div className="text-sm text-slate-200">{activeItem.description}</div>
        </div>
      </div>
    </div>
  );
}

function QuickStats() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Timetable Lookup
        </div>
        <div className="mt-2 text-sm text-slate-700">
          Search timetable by department, semester, section, and academic year.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Generate Schedule
        </div>
        <div className="mt-2 text-sm text-slate-700">
          Run the timetable generator using your current teachers, rooms, subjects, and constraints.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Resource Management
        </div>
        <div className="mt-2 text-sm text-slate-700">
          Update teachers, subjects, rooms, and related data used by the solver.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Constraint Control
        </div>
        <div className="mt-2 text-sm text-slate-700">
          Define scheduling rules to avoid clashes and maintain feasibility.
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-5">
      <DashboardHeader />

      <QuickStats />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Navigation</h2>
            <p className="text-sm text-slate-500">
              Open any admin module from the tabs below.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {NAV_ITEMS.map((item) => (
            <Tab
              key={item.to || "index"}
              to={item.to}
              label={item.label}
              description={item.description}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <Routes>
          <Route index element={<AdminTimetableLookupPage />} />
          <Route path="generate" element={<AdminGenerateTimetablePage />} />
          <Route path="teachers" element={<AdminTeachersPage />} />
          <Route path="subjects" element={<AdminSubjectsPage />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="constraints" element={<AdminConstraintsPage />} />
          <Route path="edit-entry/:entryId" element={<AdminEditEntryPage />} />
        </Routes>
      </div>
    </div>
  );
}