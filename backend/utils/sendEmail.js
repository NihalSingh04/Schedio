import nodemailer from "nodemailer";
import dns from "dns";

/*
=================================
FORCE IPV4 (CRITICAL FOR RENDER)
=================================
*/

dns.setDefaultResultOrder("ipv4first");

export const sendEmail = async ({ to, subject, text }) => {
  try {

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log(
      "EMAIL_PASS:",
      process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌"
    );

    /*
    =================================
    CREATE TRANSPORTER (SAFE CONFIG)
    =================================
    */

    const transporter = nodemailer.createTransport({

      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      /*
      Prevent IPv6 / network issues
      */

      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,

      tls: {
        rejectUnauthorized: false,
      },

      family: 4, // FORCE IPv4
    });

    /*
    =================================
    VERIFY CONNECTION
    =================================
    */

    await transporter.verify();

    console.log("SMTP connection ready");

    /*
    =================================
    SEND EMAIL
    =================================
    */

    const info = await transporter.sendMail({
      from: `"Schedio" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("📧 Email sent successfully");
    console.log("Message ID:", info.messageId);

    return info;

  } catch (error) {

    console.error("❌ Email sending failed");
    console.error(error.message);

  }
};