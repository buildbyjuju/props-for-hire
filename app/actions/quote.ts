"use server";

import { format } from "date-fns";
import { put } from "@vercel/blob";
import { Resend } from "resend";
import { z } from "zod";
import { requireDb } from "@/lib/db";
import { quoteRequests } from "@/lib/db/schema";

const quoteSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim(),
  phone: z.string().trim(),
  description: z.string().trim().min(1),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function submitQuote(formData: FormData) {
  const parsed = quoteSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fill in all required fields and provide email or phone.",
    };
  }

  const data = parsed.data;
  const email = data.email;
  const phone = data.phone;

  if (!email && !phone) {
    return {
      success: false,
      error: "Please provide an email address or phone number.",
    };
  }

  if (email && !z.string().email().safeParse(email).success) {
    return { success: false, error: "Please enter a valid email address." };
  }
  const photoUrls: string[] = [];
  const files = formData.getAll("photos") as File[];

  for (const file of files) {
    if (!file || file.size === 0) continue;
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed." };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "Each image must be under 5MB." };
    }

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`quotes/${Date.now()}-${file.name}`, file, {
        access: "public",
      });
      photoUrls.push(blob.url);
    }
  }

  const eventDate = format(new Date(), "yyyy-MM-dd");

  let savedToDb = false;
  try {
    const database = requireDb();
    await database.insert(quoteRequests).values({
      name: data.name,
      email: email || "not-provided@dreamscape.local",
      phone: phone || "Not provided",
      eventDate,
      setupTime: "TBC",
      eventType: "Enquiry",
      notes: data.description,
      inspirationUrls: photoUrls,
    });
    savedToDb = true;
  } catch {
    // DB optional during initial setup
  }

  const notifyEmail = process.env.QUOTE_NOTIFICATION_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  let emailSent = false;

  if (resendKey && notifyEmail) {
    const resend = new Resend(resendKey);
    const photoLinks =
      photoUrls.length > 0
        ? photoUrls.map((u) => `<li><a href="${u}">${u}</a></li>`).join("")
        : "<li>No photos uploaded</li>";

    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        "Dreamscape Event <onboarding@resend.dev>",
      to: notifyEmail,
      replyTo: email || undefined,
      subject: `New enquiry from ${data.name}`,
      html: `
        <h2>New enquiry</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${email || "—"}</p>
        <p><strong>Phone:</strong> ${phone || "—"}</p>
        <p><strong>Description:</strong></p>
        <p>${data.description.replace(/\n/g, "<br>")}</p>
        <h3>Photos</h3>
        <ul>${photoLinks}</ul>
      `,
    });
    emailSent = !error;
  }

  if (!emailSent && !savedToDb) {
    return {
      success: false,
      error:
        "Quote service is not configured yet. Add DATABASE_URL, RESEND_API_KEY, and QUOTE_NOTIFICATION_EMAIL.",
    };
  }

  return { success: true };
}
