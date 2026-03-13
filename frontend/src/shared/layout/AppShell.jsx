// import React from "react";
// import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
// import Button from "../ui/Button.jsx";
// import { useAuth } from "../auth/AuthContext.jsx";

// function NavLink({ to, children }) {
//   const { pathname } = useLocation();
//   const active = pathname === to || pathname.startsWith(to + "/");
//   return (
//     <Link
//       to={to}
//       className={[
//         "rounded-xl px-3 py-2 text-sm transition",
//         active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
//       ].join(" ")}
//     >
//       {children}
//     </Link>
//   );
// }

// export default function AppShell() {
//   const { isAuthed, user, logout } = useAuth();
//   const navigate = useNavigate();

//   function onLogout() {
//     logout();
//     navigate("/student");
//   }

//   return (
//     <div className="min-h-screen">
//       <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
//         <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
//           <Link to="/student" className="flex items-center gap-2">
//             <div className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-900 text-white text-sm font-semibold">
//               TT
//             </div>
//             <div className="leading-tight">
//               <div className="text-sm font-semibold">Where is My TimeTable</div>
//               <div className="text-xs text-slate-500">CP-SAT Generator</div>
//             </div>
//           </Link>

//           <nav className="hidden items-center gap-2 md:flex">
//             <NavLink to="/student">Student</NavLink>
//             {isAuthed && user?.role === "admin" ? <NavLink to="/admin">Admin</NavLink> : null}
//             {isAuthed ? <NavLink to="/faculty">Faculty</NavLink> : null}
//           </nav>

//           <div className="flex items-center gap-2">
//             {isAuthed ? (
//               <>
//                 <div className="hidden text-right md:block">
//                   <div className="text-sm font-semibold">{user.username}</div>
//                   <div className="text-xs text-slate-500">
//                     {user.role}{user.department ? ` • ${user.department}` : ""}
//                   </div>
//                 </div>
//                 <Button variant="secondary" size="sm" onClick={onLogout}>
//                   Logout
//                 </Button>
//               </>
//             ) : (
//               <Button size="sm" onClick={() => navigate("/login")}>
//                 Login
//               </Button>
//             )}
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto max-w-6xl px-4 py-6">
//         <Outlet />
//       </main>

//       <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-slate-500">
//         Backend expected at <span className="font-mono">/api</span> on{" "}
//         <span className="font-mono">{import.meta.env.VITE_API_URL || "http://localhost:5001"}</span>
//       </footer>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

function ShellNavLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      onClick={onClick}
      className={[
        "rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function AppShell() {
  const { isAuthed, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function onLogout() {
    logout();
    setMobileOpen(false);
    navigate("/student");
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/student"
            className="flex items-center gap-3"
            onClick={closeMobileMenu}
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
              TT
            </div>

            <div className="leading-tight">
              <div className="text-sm font-semibold md:text-base">
                Schedio
              </div>
              <div className="text-xs text-slate-500">
                Smart timetable management
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <ShellNavLink to="/student">Student</ShellNavLink>
            {isAuthed && user?.role === "admin" ? (
              <ShellNavLink to="/admin">Admin</ShellNavLink>
            ) : null}
            {isAuthed ? <ShellNavLink to="/faculty">Faculty</ShellNavLink> : null}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthed ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    {user.username}
                  </div>
                  <div className="text-xs text-slate-500">
                    {user.role}
                    {user.department ? ` • ${user.department}` : ""}
                  </div>
                </div>

                <Button variant="secondary" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
              <ShellNavLink to="/student" onClick={closeMobileMenu}>
                Student
              </ShellNavLink>

              {isAuthed && user?.role === "admin" ? (
                <ShellNavLink to="/admin" onClick={closeMobileMenu}>
                  Admin
                </ShellNavLink>
              ) : null}

              {isAuthed ? (
                <ShellNavLink to="/faculty" onClick={closeMobileMenu}>
                  Faculty
                </ShellNavLink>
              ) : null}

              <div className="mt-2 border-t border-slate-100 pt-3">
                {isAuthed ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {user.username}
                      </div>
                      <div className="text-xs text-slate-500">
                        {user.role}
                        {user.department ? ` • ${user.department}` : ""}
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onLogout}
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      closeMobileMenu();
                      navigate("/login");
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}