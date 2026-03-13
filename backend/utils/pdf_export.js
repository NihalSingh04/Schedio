import PDFDocument from "pdfkit";

/* =========================================
   GENERATE TIMETABLE PDF
========================================= */

export const generateTimetablePDF = (entries, res) => {
  try {
    if (!entries || entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No timetable data available for PDF export",
      });
    }

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    /* ===============================
       RESPONSE HEADERS
    ================================ */

    res.setHeader("Content-Type", "application/pdf");
    // res.setHeader(
    //   "Content-Disposition",
    //   "attachment; filename=timetable.pdf"
    // );

    res.setHeader(
        "Content-Disposition",
        "inline; filename=timetable.pdf"
      );

    doc.pipe(res);

    /* ===============================
       TITLE
    ================================ */

    doc
      .fontSize(20)
      .text("University Timetable", { align: "center" })
      .moveDown(1);

    doc.fontSize(12).text(`Generated At: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    /* ===============================
       TABLE HEADER
    ================================ */

    const startX = 50;
    const startY = 150;

    const columnSpacing = 130;

    doc
      .fontSize(12)
      .text("Day", startX, startY)
      .text("Slot", startX + columnSpacing, startY)
      .text("Subject", startX + columnSpacing * 2, startY)
      .text("Teacher", startX + columnSpacing * 3, startY)
      .text("Room", startX + columnSpacing * 4, startY);

    let y = startY + 25;

    /* ===============================
       TABLE ROWS
    ================================ */

    entries.forEach((entry, index) => {
      try {
        const subject =
          entry.subjectId?.name || entry.subjectId?.code || "N/A";

        const teacher = entry.teacherId?.name || "N/A";

        const room = entry.roomId?.name || "N/A";

        const day = entry.day || "N/A";

        const slot =
          entry.slot !== undefined && entry.slot !== null
            ? entry.slot
            : "-";

        doc
          .fontSize(10)
          .text(day, startX, y)
          .text(slot.toString(), startX + columnSpacing, y)
          .text(subject, startX + columnSpacing * 2, y)
          .text(teacher, startX + columnSpacing * 3, y)
          .text(room, startX + columnSpacing * 4, y);

        y += 20;

        /* Page break protection */

        if (y > 750) {
          doc.addPage();
          y = 50;
        }
      } catch (rowError) {
        console.error("Row rendering error:", rowError);
      }
    });

    /* ===============================
       END DOCUMENT
    ================================ */

    doc.end();
  } catch (error) {
    console.error("PDF generation failed:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to generate PDF",
      });
    }
  }
};