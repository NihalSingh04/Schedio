import express from "express";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

router.get("/email", async (req, res) => {

  await sendEmail({
    to: process.env.EMAIL_USER,
    subject: "Test Email from Schedio",
    text: "If you received this email, SMTP is working."
  });

  res.json({ message: "Email function executed" });

});

export default router;