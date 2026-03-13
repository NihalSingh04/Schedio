import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "../shared/ui/Card.jsx";
import Input from "../shared/ui/Input.jsx";
import Button from "../shared/ui/Button.jsx";
import { useAuth } from "../shared/auth/AuthContext.jsx";
import { apiErrorMessage } from "../shared/api/http.js";
import { useToast } from "../shared/ui/toast/ToastContext.jsx";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const u = await login({ username, password });

      push({
        variant: "success",
        title: "Login successful",
        message: `Welcome ${u.username}`,
      });

      const from = location.state?.from;
      if (from) return navigate(from, { replace: true });

      if (u.role === "admin") return navigate("/admin", { replace: true });
      return navigate("/faculty", { replace: true });
    } catch (err) {
      push({
        variant: "error",
        title: "Login failed",
        message: apiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-stone-50 to-zinc-200">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 px-12 py-14 text-white">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Timetable Portal
            </div>

            <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight">
              A clean workspace for smarter timetable management
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
              Access your dashboard, manage academic resources, and continue your
              scheduling workflow in a calm and professional interface.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">Focused Design</div>
              <div className="mt-2 text-xs leading-6 text-slate-300">
                Minimal styling with balanced contrast and comfortable spacing.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">Easy Access</div>
              <div className="mt-2 text-xs leading-6 text-slate-300">
                Login flow built to feel smooth, modern, and distraction-free.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <Card className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 shadow-2xl backdrop-blur">
            <CardContent className="p-8 sm:p-10">
              <div className="mb-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-lg">
                  TT
                </div>

                <h2 className="mt-5 text-3xl font-semibold text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to continue
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="rounded-2xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="rounded-2xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-900 py-3 text-white shadow-md transition hover:bg-slate-800"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}