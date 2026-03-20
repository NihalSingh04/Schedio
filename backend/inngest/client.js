import dotenv from "dotenv";
dotenv.config(); // 🔥 MUST be before everything

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "cp-sat-timetable-generator",
});

console.log("EVENT KEY:", process.env.INNGEST_EVENT_KEY);