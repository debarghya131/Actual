"use server";

import type { ReactNode } from "react";
import { Resend } from "resend";

type SendEmailOptions = {
  to: string;
  subject: string;
  react: ReactNode;
};

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY is not set." };
  }

  const resend = new Resend(apiKey);

  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Finance App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    if (response.error) {
      console.error("Failed to send email:", response.error);
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
