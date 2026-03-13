import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Schedio" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log("📧 Email sent successfully");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

  } catch (error) {

    console.error("❌ Email sending failed");
    console.error(error);

  }
};