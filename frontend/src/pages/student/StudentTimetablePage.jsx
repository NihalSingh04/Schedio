import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";

import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
import Input from "../../shared/ui/Input.jsx";
import Button from "../../shared/ui/Button.jsx";
import Select from "../../shared/ui/Select.jsx";

import { http, apiErrorMessage } from "../../shared/api/http.js";
import TimetableGrid from "../../shared/timetable/TimetableGrid.jsx";

/* ===============================
   SOCKET CONNECTION
================================ */

const socket = io("https://schedio-backend.onrender.com");

/* ===============================
   CONSTANTS
================================ */

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

const SEMESTERS = [1,2,3,4,5,6,7,8];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function normalizeDept(v){
  return (v || "").trim().toUpperCase();
}

export default function StudentTimetablePage(){

  const [department,setDepartment] = useState("IT");
  const [semester,setSemester] = useState("3");
  const [section,setSection] = useState("A");
  const [academicYear,setAcademicYear] = useState("2025-26");

  const params = useMemo(() => ({
      department: normalizeDept(department),
      semester: String(semester).trim(),
      section: String(section).trim().toUpperCase(),
      academicYear: String(academicYear).trim(),
  }),[department,semester,section,academicYear]);

  const canFetch = !!(
    params.department &&
    params.semester &&
    params.section &&
    params.academicYear
  );

  const q = useQuery({
    queryKey:["student-timetable",params],
    enabled:false,
    queryFn: async () => {
      const resp = await http.get("/api/timetable/student",{params});
      return resp.data?.data;
    }
  });

  const timetable = q.data;

  async function onSearch(e){
    e.preventDefault();
    if(!canFetch) return;
    await q.refetch();
  }

  /* ===============================
     SOCKET LISTENER
  ================================ */

  useEffect(() => {

    socket.on("timetableGenerated",(data)=>{

      console.log("📡 Socket event received:",data);

      if(
        data.department === params.department &&
        String(data.semester) === String(params.semester) &&
        data.section === params.section
      ){
        alert("📅 New timetable generated!");
        q.refetch();
      }

    });

    return () => {
      socket.off("timetableGenerated");
    };

  },[params,q]);

  /* ===============================
     PDF DOWNLOAD
  ================================ */

  function downloadPDF(){

    const url =
`https://schedio-backend.onrender.com/api/timetable/export/pdf?department=${params.department}&semester=${params.semester}&section=${params.section}&academicYear=${params.academicYear}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = "timetable.pdf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* ===============================
     VIEW PDF
  ================================ */

  function viewPDF(){

    const url =
`https://schedio-backend.onrender.com/api/timetable/export/pdf?department=${params.department}&semester=${params.semester}&section=${params.section}&academicYear=${params.academicYear}`;

    window.open(url,"_blank");
  }

  return(
    <div className="space-y-4">

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white shadow-sm">
        <h1 className="text-2xl font-bold">
          Student Timetable
        </h1>
        <p className="text-sm text-slate-200">
          Search your timetable and receive realtime updates when admin generates a new schedule.
        </p>
      </div>

      <Card>
        <CardHeader>
          Timetable Search
        </CardHeader>

        <CardContent>

          <form
            onSubmit={onSearch}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >

            <Select
              value={department}
              onChange={(e)=>setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>

            <Select
              value={semester}
              onChange={(e)=>setSemester(e.target.value)}
            >
              {SEMESTERS.map(s => (
                <option key={s} value={String(s)}>
                  Semester {s}
                </option>
              ))}
            </Select>

            <Input
              value={section}
              onChange={(e)=>setSection(e.target.value)}
              placeholder="Section"
            />

            <Input
              value={academicYear}
              onChange={(e)=>setAcademicYear(e.target.value)}
              placeholder="2025-26"
            />

            <div className="md:col-span-2 xl:col-span-4 flex gap-2">

              <Button
                type="submit"
                disabled={q.isFetching}
              >
                {q.isFetching ? "Loading..." : "Get Timetable"}
              </Button>

              {timetable && (
                <>
                  <Button
                    type="button"
                    onClick={viewPDF}
                  >
                    View PDF
                  </Button>

                  <Button
                    type="button"
                    onClick={downloadPDF}
                  >
                    Download PDF
                  </Button>
                </>
              )}

            </div>

            {q.isError && (
              <div className="text-red-600">
                {apiErrorMessage(q.error)}
              </div>
            )}

          </form>

        </CardContent>
      </Card>

      {timetable ? (

        <TimetableGrid
          title={`${timetable.department} • Sem ${timetable.semester} • Sec ${timetable.section}`}
          days={DAYS.slice(0,timetable.days || 5)}
          periodsPerDay={timetable.periodsPerDay || 8}
          breakSlots={timetable.breakSlots || []}
          entries={timetable.data || []}
          showMeta
        />

      ) : null}

    </div>
  );
}