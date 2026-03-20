import { inngest } from "../client.js";
import connectDB from "../../config/db.js";

import Teacher from "../../models/Teacher.js";
import Subject from "../../models/Subject.js";
import Room from "../../models/Rooms.js";
import Constraint from "../../models/Constraint.js";
import Timetable from "../../models/Timetable.js";

import { generateTimetableWithCPSAT } from "../../service/timetableService.js";
import { sendEmail } from "../../utils/sendEmail.js";

export const generateTimetableJob = inngest.createFunction(
  { id: "generate-timetable-job" },
  { event: "timetable/generate" },

  async ({ event }) => {
    console.log("🔥 INNGEST FUNCTION STARTED");

    await connectDB();

    try {
      const { department, semester, section, academicYear } = event.data;

      const dept = department.toUpperCase();
      const sec = section.toUpperCase();
      const semesterNum = Number(semester);

      /* ===============================
         FETCH DATA
      =============================== */
      const teachers = await Teacher.find({ department: dept });
      const subjects = await Subject.find({
        department: dept,
        semester: semesterNum,
      });
      const rooms = await Room.find({ department: dept });
      const constraints = await Constraint.find({ department: dept });

      console.log("📊 DATA CHECK:");
      console.log("Teachers:", teachers.length);
      console.log("Subjects:", subjects.length);
      console.log("Rooms:", rooms.length);

      if (!teachers.length || !subjects.length || !rooms.length) {
        throw new Error("Missing required data (teachers/subjects/rooms)");
      }

      /* ===============================
         RUN SOLVER
      =============================== */
      const result = await generateTimetableWithCPSAT({
        teachers,
        subjects,
        rooms,
        constraints,
        semester: semesterNum,
        section: sec,
      });

      if (!result?.success) {
        throw new Error(result?.error || "Solver failed");
      }

      /* ===============================
         SAVE TIMETABLE
      =============================== */
      const saved = await Timetable.findOneAndUpdate(
        {
          department: dept,
          semester: semesterNum,
          section: sec,
          academicYear,
          isActive: true,
        },
        {
          department: dept,
          semester: semesterNum,
          section: sec,
          academicYear,
          data: result.data,
          conflicts: result.conflicts,
          score: result.score,
          generatedBy: "CP-SAT",
          generatedAt: new Date(),
          isActive: true,
        },
        { upsert: true, returnDocument: "after" }
      );

      console.log("✅ Timetable saved:", saved?._id);

      /* ===============================
         EMAIL (optional)
      =============================== */
      if (process.env.EMAIL_USER) {
        await sendEmail({
          to: process.env.EMAIL_USER,
          subject: "Timetable Generated",
          text: `Generated for ${dept} Sem ${semesterNum}`,
        });
      }

      return { success: true };

    } catch (error) {
      console.error("❌ INNGEST ERROR:", error.message);
      throw error;
    }
  }
);