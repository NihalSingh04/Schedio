import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const generateTimetableWithCPSAT = async ({
  teachers,
  subjects,
  rooms,
  constraints,
  semester,
  section,
}) => {
  try {

    /* ==============================
       CLEAN TEACHERS
    ============================== */

    const cleanTeachers = teachers.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      subjects: (t.subjects || []).map((s) => ({
        subjectId: s.subjectId.toString(),
      })),
      maxHoursPerDay: t.maxHoursPerDay || 6,
      availability: t.availability || [],
    }));

    /* ==============================
       CLEAN SUBJECTS
    ============================== */

    const cleanSubjects = subjects.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      weeklyHours: s.weeklyHours || 3,
      requiresLab: s.requiresLab || false,
      labDuration: s.labDuration || 1,
    }));

    /* ==============================
       CLEAN ROOMS
    ============================== */

    const cleanRooms = rooms.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      type: r.type,
      capacity: r.capacity,
    }));

    /* ==============================
       CLEAN CONSTRAINTS
    ============================== */

    const cleanConstraints = constraints.map((c) => ({
      type: c.type,
      teacherId: c.teacherId?.toString(),
      roomId: c.roomId?.toString(),
      subjectId: c.subjectId?.toString(),
      day: c.day,
      slots: c.slots,
      rule: c.rule,
      priority: c.priority,
    }));

    /* ==============================
       SOLVER INPUT
    ============================== */

    const solverInput = {
      teachers: cleanTeachers,
      subjects: cleanSubjects,
      rooms: cleanRooms,
      constraints: cleanConstraints,
      days: 5,
      periodsPerDay: 8,
      breakSlots: [4],
      semester,
      section,
    };

    /* ==============================
       PYTHON PATH (ENV SAFE)
    ============================== */

    const pythonPath =
      process.env.PYTHON_PATH ||
      (process.env.NODE_ENV === "production"
        ? "python3"
        : "venv/bin/python");

    /* ==============================
       SOLVER FILE PATH
    ============================== */

    const solverPath = path.join(
      process.cwd(),
      "solver",
      "cpSatSolver.py"
    );

    console.log("Using Python:", pythonPath);
    console.log("Solver path:", solverPath);

    /* ==============================
       VERIFY FILE EXISTS
    ============================== */

    if (!fs.existsSync(solverPath)) {
      console.error("Solver file not found:", solverPath);

      return {
        success: false,
        error: "Solver file not found",
      };
    }

    return new Promise((resolve) => {

      /* ==============================
         SPAWN PYTHON PROCESS
      ============================== */

      const python = spawn(pythonPath, [solverPath]);

      let outputData = "";
      let errorData = "";

      /* ==============================
         SPAWN ERROR HANDLER
      ============================== */

      python.on("error", (err) => {
        console.error("Spawn error:", err);

        resolve({
          success: false,
          error: err.message,
        });
      });

      /* ==============================
         TIMEOUT (30s)
      ============================== */

      const timeout = setTimeout(() => {
        console.error("Solver timeout");

        python.kill();

        resolve({
          success: false,
          error: "Solver timeout exceeded",
        });

      }, 30000);

      /* ==============================
         SEND INPUT
      ============================== */

      try {
        python.stdin.write(JSON.stringify(solverInput));
        python.stdin.end();
      } catch (err) {
        console.error("Failed to send input:", err);

        clearTimeout(timeout);

        return resolve({
          success: false,
          error: "Failed to send data to solver",
        });
      }

      /* ==============================
         RECEIVE OUTPUT
      ============================== */

      python.stdout.on("data", (data) => {
        outputData += data.toString();
      });

      python.stderr.on("data", (data) => {
        errorData += data.toString();
      });

      /* ==============================
         PROCESS COMPLETE
      ============================== */

      python.on("close", (code) => {

        clearTimeout(timeout);

        console.log("Python exit code:", code);

        if (code !== 0) {
          console.error("Python error:", errorData);

          return resolve({
            success: false,
            error:
              errorData ||
              "Python solver failed",
          });
        }

        try {

          const parsed = JSON.parse(outputData);

          console.log("Solver success");

          resolve({
            success: true,
            data: parsed.timetable || [],
            conflicts: parsed.conflicts || [],
            score: parsed.score || 0,
          });

        } catch (err) {

          console.error(
            "Invalid JSON from solver:",
            outputData
          );

          resolve({
            success: false,
            error: "Invalid JSON from solver",
          });

        }

      });

    });

  } catch (error) {

    console.error("Service error:", error);

    return {
      success: false,
      error: error.message,
    };

  }
};