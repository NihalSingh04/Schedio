import Timetable from "../models/Timetable.js";
import { generateTimetablePDF } from "../utils/pdf_export.js";

import { inngest } from "../inngest/client.js";
import { getIO } from "../socket/socketServer.js";

/* =========================================
   GENERATE TIMETABLE
========================================= */
export const generateTimetable = async (req, res) => {
  try {
    const { department, semester, section, academicYear } = req.body;

    if (!department || !semester || !section || !academicYear) {
      return res.status(400).json({
        success: false,
        message:
          "Department, semester, section, and academicYear are required",
      });
    }

    const dept = department.toUpperCase().trim();
    const sec = section.toUpperCase().trim();
    const semesterNum = Number(semester);
    const year = academicYear.trim();

    if (isNaN(semesterNum)) {
      return res.status(400).json({
        success: false,
        message: "Semester must be a valid number",
      });
    }

    /* SOCKET START EVENT */
    let io;
    try {
      io = getIO();
    } catch {}

    io?.emit("timetableProgress", {
      status: "started",
      message: "Timetable generation started...",
    });

    /* TRIGGER INNGEST */
    await inngest.send({
      name: "timetable/generate",
      data: {
        department: dept,
        semester: semesterNum,
        section: sec,
        academicYear: year,
      },
    });

    return res.json({
      success: true,
      message: "Timetable generation started in background",
    });

  } catch (error) {
    console.error("❌ ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to start timetable generation",
      error: error.message,
    });
  }
};

/* =========================================
   GET TIMETABLE
========================================= */
export const getTimetable = async (req, res) => {
  try {
    const { department, semester, section, academicYear } = req.query;

    if (!department || !semester || !section || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Missing query parameters",
      });
    }

    const dept = department.toUpperCase().trim();
    const sec = section.toUpperCase().trim();
    const semesterNum = Number(semester);
    const year = academicYear.trim();

    console.log("Searching timetable:", {
      dept,
      semesterNum,
      sec,
      year,
    });

    const timetable = await Timetable.findOne({
      department: { $regex: `^${dept}$`, $options: "i" },
      semester: semesterNum,
      section: { $regex: `^${sec}$`, $options: "i" },
      academicYear: year,
      isActive: true,
    })
      .populate("data.teacherId", "name")
      .populate("data.roomId", "name")
      .populate("data.subjectId", "name code");

    if (!timetable) {
      console.log("No timetable found");

      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    console.log("✅ Timetable found:", timetable._id);

    return res.json({
      success: true,
      data: timetable,
    });

  } catch (error) {
    console.error("❌ GET TIMETABLE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================
   EXPORT PDF
========================================= */
export const exportTimetablePDF = async (req, res) => {
  try {
    const { department, semester, section, academicYear } = req.query;

    const dept = department.toUpperCase().trim();
    const sec = section.toUpperCase().trim();
    const semesterNum = Number(semester);
    const year = academicYear.trim();

    const timetable = await Timetable.findOne({
      department: dept,
      semester: semesterNum,
      section: sec,
      academicYear: year,
      isActive: true,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    generateTimetablePDF(timetable.data, res);

  } catch (error) {
    console.error("❌ EXPORT PDF ERROR:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================
   GET BY TEACHER
========================================= */
export const getTimetableByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const timetables = await Timetable.find({
      "data.teacherId": teacherId,
      isActive: true,
    });

    if (!timetables.length) {
      return res.status(404).json({
        success: false,
        message: "No timetables found",
      });
    }

    return res.json({
      success: true,
      data: timetables,
    });

  } catch (error) {
    console.error("❌ GET BY TEACHER ERROR:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================
   UPDATE ENTRY
========================================= */
export const updateTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findOne({
      "data._id": id,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Entry not found",
      });
    }

    const entry = timetable.data.id(id);

    Object.assign(entry, req.body);

    await timetable.save();

    return res.json({
      success: true,
      message: "Entry updated successfully",
      data: entry,
    });

  } catch (error) {
    console.error("❌ UPDATE ENTRY ERROR:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* =========================================
   DELETE TIMETABLE
========================================= */
export const deleteTimetable = async (req, res) => {
  try {
    const { department, semester, section, academicYear } = req.body;

    const dept = department.toUpperCase().trim();
    const sec = section.toUpperCase().trim();
    const semesterNum = Number(semester);
    const year = academicYear.trim();

    const timetable = await Timetable.findOneAndDelete({
      department: dept,
      semester: semesterNum,
      section: sec,
      academicYear: year,
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    return res.json({
      success: true,
      message: "Timetable deleted successfully",
    });

  } catch (error) {
    console.error("❌ DELETE TIMETABLE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};