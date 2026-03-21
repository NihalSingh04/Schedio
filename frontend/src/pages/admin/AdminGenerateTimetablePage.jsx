import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
import Input from "../../shared/ui/Input.jsx";
import Button from "../../shared/ui/Button.jsx";
import Select from "../../shared/ui/Select.jsx";
import { apiErrorMessage } from "../../shared/api/http.js";
import TimetableGrid from "../../shared/timetable/TimetableGrid.jsx";
import {
  generateTimetable,
  getTimetable,
} from "../../features/admin/adminApi.js";
import { useToast } from "../../shared/ui/toast/ToastContext.jsx";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//departments
const DEPARTMENTS = [
  "CSE",
  "IT",
  "CSAIML",
  "CSDS",
  "CSAI",
  "AIML",
  "AIDS",
  "ECE",
  "EEE",
  "ME",
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function normalizeDept(v) {
  return (v || "").trim().toUpperCase();
}

export default function AdminGenerateTimetablePage() {
  const { push } = useToast();

  const [department, setDepartment] = useState("IT");
  const [semester, setSemester] = useState(3);
  const [section, setSection] = useState("A");
  const [academicYear, setAcademicYear] = useState("2025-26");
  const [generatedTimetable, setGeneratedTimetable] = useState(null);

  const params = useMemo(
    () => ({
      department: normalizeDept(department),
      semester: Number(semester),
      section: String(section).trim().toUpperCase(),
      academicYear: String(academicYear).trim(),
      days: 5,
      periodsPerDay: 8,
      breakSlots: [4],
    }),
    [department, semester, section, academicYear]
  );

  const lookup = useQuery({
    queryKey: ["admin-generate-lookup", params],
    enabled: false,
    queryFn: () => getTimetable(params),
  });

  /*
  =============================
  POLLING FUNCTION (FIX)
  =============================
  */

  async function pollForTimetable() {
    let attempts = 0;
    const maxAttempts = 15;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const result = await lookup.refetch();

        if (result.data) {
          clearInterval(interval);

          setGeneratedTimetable(result.data);

          push({
            variant: "success",
            title: "Timetable Ready",
            message: "Timetable generated successfully",
          });
        }

      } catch (err) {
        // ignore 404 while waiting
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);

        push({
          variant: "error",
          title: "Timeout",
          message: "Timetable generation is taking longer than expected",
        });
      }

    }, 2000);
  }

  /*
  =============================
  GENERATE MUTATION
  =============================
  */

  const gen = useMutation({
    mutationFn: () => generateTimetable(params),

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Generation Started",
        message: "Timetable is being generated...",
      });

      pollForTimetable();
    },

    onError: (e) => {
      setGeneratedTimetable(null);

      push({
        variant: "error",
        title: "Generation failed",
        message: apiErrorMessage(e),
      });
    },
  });

  function onGenerate(e) {
    e.preventDefault();
    gen.mutate();
  }

  async function onLoadExisting() {
    const result = await lookup.refetch();

    if (result.data) {
      setGeneratedTimetable(result.data);
    }
  }

  const tt = generatedTimetable || lookup.data || null;

  return (
    <div className="space-y-4">

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Generate Timetable
            </h1>

            <p className="mt-1 text-sm text-slate-200">
              Create a timetable for the selected department, semester,
              section, and academic year.
            </p>
          </div>

          <div className="rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wide text-slate-200">
              Current Selection
            </div>

            <div className="mt-1 font-medium text-white">
              {department} • Sem {semester} • Sec {section || "—"}
            </div>
          </div>

        </div>
      </div>

      <Card className="overflow-hidden border-slate-200">

        <CardHeader className="border-b border-slate-100 bg-slate-50">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="text-lg font-semibold text-slate-900">
                Timetable Generator
              </div>

              <div className="mt-1 text-sm text-slate-500">
                Fill in the details below and generate or load an existing timetable.
              </div>
            </div>

            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Solver Ready
            </div>

          </div>
        </CardHeader>

        <CardContent className="p-5">

          <form
            onSubmit={onGenerate}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Department
              </label>

              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Semester
              </label>

              <Select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Section
              </label>

              <Input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Enter section"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Academic Year
              </label>

              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2025-26"
              />
            </div>

            <div className="md:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-2 pt-1">

              <Button
                type="submit"
                disabled={gen.isPending || lookup.isFetching}
              >
                {gen.isPending || lookup.isFetching
                  ? "Generating..."
                  : "Generate Timetable"}
              </Button>

              <Button
                variant="secondary"
                type="button"
                onClick={onLoadExisting}
                disabled={lookup.isFetching}
              >
                {lookup.isFetching ? "Loading..." : "Load Existing"}
              </Button>

            </div>

          </form>

        </CardContent>
      </Card>

      {tt && (
        <Card className="overflow-hidden border-slate-200">

          <CardHeader className="border-b border-slate-100 bg-slate-50">

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

              <div>
                <div className="text-lg font-semibold text-slate-900">
                  Generated Timetable
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {tt.department} • Sem {tt.semester} • Sec {tt.section} • {tt.academicYear}
                </div>
              </div>

              <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Loaded Successfully
              </div>

            </div>

          </CardHeader>

          <CardContent className="p-5">

            <TimetableGrid
              title={`${tt.department} • Sem ${tt.semester} • Sec ${tt.section} • ${tt.academicYear}`}
              days={DAYS.slice(0, tt.days || 5)}
              periodsPerDay={tt.periodsPerDay || 8}
              breakSlots={tt.breakSlots || []}
              entries={tt.data || []}
              showMeta
            />

          </CardContent>

        </Card>
      )}

    </div>
  );
}