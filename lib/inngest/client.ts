import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "actual", // Unique app ID
  name: "Actual",
  isDev: process.env.NODE_ENV === "development" || process.env.INNGEST_DEV === "1",
  retryFunction: async (attempt: number) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 2,
  }),
});
