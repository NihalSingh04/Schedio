import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
import Input from "../../shared/ui/Input.jsx";
import Button from "../../shared/ui/Button.jsx";
import { http, apiErrorMessage } from "../../shared/api/http.js";
import TimetableGrid from "../../shared/timetable/TimetableGrid.jsx";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function FacultyDashboard() {
  const [teacherId, setTeacherId] = useState("");
  const [submittedId, setSubmittedId] = useState("");

  const scheduleQ = useQuery({
    queryKey: ["faculty-schedule", submittedId],
    enabled: !!submittedId,
    queryFn: async () => {
      const resp = await http.get(`/api/faculty/schedule/${submittedId}`);
      return resp.data?.data;
    },
  });

  const workloadQ = useQuery({
    queryKey: ["faculty-workload", submittedId],
    enabled: !!submittedId,
    queryFn: async () => {
      const resp = await http.get(`/api/faculty/workload/${submittedId}`);
      return resp.data?.data;
    },
  });

  function onFetch(e) {
    e.preventDefault();
    setSubmittedId(teacherId.trim());
  }

  const teacher = scheduleQ.data?.teacher;
  const schedule = scheduleQ.data?.schedule || [];

  const summary = useMemo(() => {
    const workload = workloadQ.data?.workload;

    return {
      totalSchedules: schedule.length,
      totalClasses: workload?.totalClasses ?? 0,
      uniqueSubjects: workload?.uniqueSubjects ?? 0,
      averagePerDay:
        workload?.averagePerDay != null
          ? Number(workload.averagePerDay).toFixed(2)
          : "0.00",
    };
  }, [schedule, workloadQ.data]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Faculty Dashboard</h1>
            <p className="mt-1 text-sm text-slate-200">
              View teaching schedule and workload details for a faculty member.
            </p>
          </div>

          <div className="rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wide text-slate-200">
              Current Teacher ID
            </div>
            <div className="mt-1 font-medium text-white">
              {submittedId || "Not selected"}
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">
                Search Faculty Schedule
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Enter the faculty teacher ID to load schedule and workload.
              </div>
            </div>

            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Faculty View
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <form
            onSubmit={onFetch}
            className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Teacher ID
              </label>
              <Input
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="Enter Teacher's UniqueId "
              />
              <div className="mt-2 text-xs text-slate-500">
                Teacher listing is not exposed on faculty routes, so use the ID shared by admin.
              </div>
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={!teacherId.trim() || scheduleQ.isFetching}
              >
                {scheduleQ.isFetching ? "Loading..." : "Fetch Schedule"}
              </Button>
            </div>

            {(scheduleQ.isError || workloadQ.isError) ? (
              <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {apiErrorMessage(scheduleQ.error || workloadQ.error)}
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {teacher ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Faculty Name
              </div>
              <div className="mt-2 text-lg font-bold text-slate-900">
                {teacher.name}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {teacher.department}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Classes
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {summary.totalClasses}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Unique Subjects
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {summary.uniqueSubjects}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Avg / Day
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {summary.averagePerDay}
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Faculty Information
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Personal and workload overview for the selected faculty member.
                  </div>
                </div>

                <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Data Loaded
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Teacher Name
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {teacher.name}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Department
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {teacher.department || "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {teacher.email || "—"}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      {schedule.length ? (
        <div className="space-y-4">
          {schedule.map((tt, idx) => (
            <TimetableGrid
              key={idx}
              title={`${tt.department} • Sem ${tt.semester} • Sec ${tt.section} • ${tt.academicYear}`}
              days={DAYS}
              periodsPerDay={8}
              breakSlots={[]}
              entries={tt.classes || []}
              showMeta
            />
          ))}
        </div>
      ) : submittedId ? (
        <Card className="border-slate-200">
          <CardContent className="p-6 text-sm text-slate-600">
            No schedule found for this faculty member.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}