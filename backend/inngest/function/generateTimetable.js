import { inngest } from "../client.js";
import connectDB from "../../config/db.js";

import Teacher from "../../models/Teacher.js";
import Subject from "../../models/Subject.js";
import Room from "../../models/Rooms.js";
import Constraint from "../../models/Constraint.js";
import Timetable from "../../models/Timetable.js";

import { generateTimetableWithCPSAT } from "../../service/timetableService.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { io } from "../../server.js";

export const generateTimetableJob = inngest.createFunction(
  { id: "generate-timetable-job" },
  { event: "timetable/generate" },

  async ({ event }) => {

    console.log("🔥 INNGEST FUNCTION STARTED");
    console.log("Event payload:", event.data);

    try {

      await connectDB();

      const { department, semester, section, academicYear } = event.data;

      const semesterNum = Number(semester);

      const teachers = await Teacher.find({ department });

      const subjects = await Subject.find({
        department,
        semester: semesterNum
      });

      const rooms = await Room.find({ department });

      const constraints = await Constraint.find({});

      const result = await generateTimetableWithCPSAT({
        teachers,
        subjects,
        rooms,
        constraints,
        semester: semesterNum,
        section,
      });

      if (!result || !result.success) {
        throw new Error("Timetable generation failed");
      }

      const saved = await Timetable.findOneAndUpdate(
        {
          department,
          semester: semesterNum,
          section,
          academicYear,
          isActive: true
        },
        {
          department,
          semester: semesterNum,
          section,
          academicYear,
          data: result.data || [],
          conflicts: result.conflicts || [],
          score: result.score || 0,
          generatedBy: "CP-SAT",
          generatedAt: new Date(),
          isActive: true
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );

      console.log("✅ Timetable saved:", saved?._id);

      /* ===============================
         SOCKET NOTIFICATION
      =============================== */

      io.emit("timetableGenerated", {
        department,
        semester: semesterNum,
        section,
        academicYear
      });

      console.log("📡 Socket event emitted");

      /* ===============================
         EMAIL NOTIFICATION
      =============================== */

      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: "📅 Timetable Generated Successfully",
        text: `Timetable generated for ${department} Semester ${semester} Section ${section}`
      });

      console.log("📧 Email notification sent");

      return { success: true };

    } catch (error) {

      console.error("❌ INNGEST FUNCTION ERROR:", error);

      throw error;
    }
  }
);