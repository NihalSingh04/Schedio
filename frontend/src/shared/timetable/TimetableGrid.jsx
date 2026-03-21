
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader } from "../ui/Card.jsx";
import { displayRef, groupEntries } from "./timetableUtils.js";

function Cell({ entry, isBreak }) {
  if (isBreak) {
    return (
      <div className="h-full min-h-[110px] rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-3 text-center shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Break
        </div>
        <div className="mt-2 text-[11px] text-amber-600">
          No class scheduled
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="h-full min-h-[110px] rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
        <div className="flex h-full items-center justify-center text-xs font-medium text-slate-400">
          Empty
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[110px] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
        Scheduled
      </div>

      <div className="mt-3 text-sm font-semibold leading-snug text-slate-900">
        {displayRef(entry.subjectId)}
      </div>

      <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
        <div className="rounded-lg bg-slate-50 px-2.5 py-2">
          <span className="font-semibold text-slate-700">Teacher:</span>{" "}
          <span className="font-medium">{displayRef(entry.teacherId)}</span>
        </div>

        <div className="rounded-lg bg-slate-50 px-2.5 py-2">
          <span className="font-semibold text-slate-700">Room:</span>{" "}
          <span className="font-medium">{displayRef(entry.roomId)}</span>
        </div>
      </div>
    </div>
  );
}

export default function TimetableGrid({
  title,
  days,
  periodsPerDay,
  breakSlots = [],
  entries,
  showMeta = false,
}) {
  const entryMap = useMemo(() => groupEntries(entries), [entries]);

  const totalCells = days.length * periodsPerDay;
  const scheduledCount = entries?.length || 0;
  const breakCount = days.length * breakSlots.length;

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="truncate text-xl font-semibold text-slate-900">
              {title}
            </div>

            {showMeta ? (
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="inline-flex rounded-full bg-white px-3 py-1 shadow-sm">
                  Days: <span className="ml-1 font-medium">{days.length}</span>
                </span>
                <span className="inline-flex rounded-full bg-white px-3 py-1 shadow-sm">
                  Periods/day:
                  <span className="ml-1 font-medium">{periodsPerDay}</span>
                </span>
                <span className="inline-flex rounded-full bg-white px-3 py-1 shadow-sm">
                  Break slots:
                  <span className="ml-1 font-medium">
                    {breakSlots.length ? breakSlots.join(", ") : "None"}
                  </span>
                </span>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Scheduled
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                {scheduledCount}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Break Cells
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                {breakCount}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Total Cells
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                {totalCells}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-3">
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `170px repeat(${periodsPerDay}, minmax(170px, 1fr))`,
            }}
          >
            <div className="sticky left-0 z-20 rounded-2xl border border-slate-200 bg-slate-900 p-3 text-center text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              Day / Slot
            </div>

            {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map((slot) => (
              <div
                key={slot}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Period
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">
                  P{slot}
                </div>
              </div>
            ))}

            {days.map((day) => (
              <React.Fragment key={day}>
                <div className="sticky left-0 z-10 flex min-h-[110px] items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Day
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900">
                      {day}
                    </div>
                  </div>
                </div>

                {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map((slot) => {
                  const isBreak = breakSlots.includes(slot);
                  const entry = entryMap.get(`${day}|${slot}`);

                  return (
                    <Cell
                      key={`${day}-${slot}`}
                      entry={entry}
                      isBreak={isBreak}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}