// Supabase Edge Function: submit-feedback
//
// Receives a bug report or feature request from the app and emails it to
// the developer. The recipient address is intentionally only ever
// referenced here, server-side — it is never sent to or stored in any
// client-facing code, so end users never see it.
//
// Required secrets: RESEND_API_KEY (API key for https://resend.com)
//
// Built on Supabase's `withSupabase` helper (@supabase/server), which
// verifies the caller's JWT before the handler runs (auth: "user") and
// handles CORS/OPTIONS automatically. Unlike the generic "send an email"
// starter this was adapted from, the recipient, subject, and HTML body are
// built here from validated fields rather than taken from the request —
// letting the caller supply `to`/`subject`/`html` directly would leak the
// recipient's privacy and let any signed-in user relay arbitrary HTML
// through this project's Resend account.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const FEEDBACK_RECIPIENT = "grantmatai@gmail.com";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Hard ceilings enforced server-side, independent of any client-side limits.
const MAX_SHORT_FIELD = 1000;
const MAX_LONG_FIELD = 2000;
const MAX_REQUEST_BYTES = 20000;

// Escapes text for safe placement inside an HTML document body. Combined
// with the fact that every user-supplied value below is only ever placed
// in the HTML *body* (never in an attribute, URL, or the email's headers),
// this closes off script/markup injection into the outgoing email.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Trims, caps length, and rejects anything that isn't a plain string.
// Also drops non-printable control characters (keeping tab and newline so
// multi-line input still reads naturally) so the payload stays plain text.
function sanitizeField(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";

  const TAB = 9;
  const NEWLINE = 10;
  const SPACE = 32;
  const DEL = 127;

  let cleaned = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    const isDisallowedControl = (code < SPACE && code !== TAB && code !== NEWLINE) || code === DEL;
    if (!isDisallowedControl) {
      cleaned += ch;
    }
  }

  return cleaned.trim().slice(0, maxLength);
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    if (!RESEND_API_KEY) {
      console.error("submit-feedback: RESEND_API_KEY is not configured");
      return Response.json({ error: "Feedback delivery is not configured." }, { status: 500 });
    }

    // Reject oversized bodies outright before any parsing.
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > MAX_REQUEST_BYTES) {
      return Response.json({ error: "Request too large." }, { status: 413 });
    }

    let body: Record<string, unknown>;
    try {
      const raw = await req.text();
      if (raw.length > MAX_REQUEST_BYTES) {
        return Response.json({ error: "Request too large." }, { status: 413 });
      }
      body = JSON.parse(raw);
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const type = body["type"];
    if (type !== "bug" && type !== "feature") {
      return Response.json({ error: "Invalid feedback type." }, { status: 400 });
    }

    let subject: string;
    let sections: { label: string; value: string }[];

    if (type === "bug") {
      const stepsToReproduce = sanitizeField(body["stepsToReproduce"], MAX_LONG_FIELD);
      const expectedResult = sanitizeField(body["expectedResult"], MAX_SHORT_FIELD);
      const actualResult = sanitizeField(body["actualResult"], MAX_SHORT_FIELD);

      if (!stepsToReproduce || !expectedResult || !actualResult) {
        return Response.json({ error: "Please fill in all fields." }, { status: 400 });
      }

      subject = "Habit Tycoon Bug Report";
      sections = [
        { label: "Steps to Reproduce", value: stepsToReproduce },
        { label: "Expected Result", value: expectedResult },
        { label: "Actual Result", value: actualResult },
      ];
    } else {
      const details = sanitizeField(body["details"], MAX_LONG_FIELD);
      if (!details) {
        return Response.json({ error: "Please describe the feature." }, { status: 400 });
      }

      subject = "Habit Tycoon Feature Request";
      sections = [{ label: "Feature Idea", value: details }];
    }

    // The reporter identity comes from the verified JWT (already checked by
    // withSupabase before this handler ran), never from the request body,
    // so it can't be spoofed by the caller.
    const reporterEmail = ctx.userClaims?.email ?? null;
    const reporterId = ctx.userClaims?.id ?? "unknown";

    const htmlSections = sections
      .map(
        (s) =>
          '<h3 style="margin:16px 0 4px;font-family:sans-serif;">' + escapeHtml(s.label) + "</h3>" +
          '<p style="white-space:pre-wrap;margin:0;font-family:sans-serif;">' + escapeHtml(s.value) + "</p>"
      )
      .join("");

    const html =
      '<div style="font-family:sans-serif;color:#1a1a1a;">' +
      "<p><strong>Reporter:</strong> " + escapeHtml(reporterEmail ?? "unknown") + " (" + escapeHtml(reporterId) + ")</p>" +
      htmlSections +
      "</div>";

    const text =
      "Reporter: " + (reporterEmail ?? "unknown") + " (" + reporterId + ")\n\n" +
      sections.map((s) => s.label + ":\n" + s.value).join("\n\n");

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Habit Tycoon Feedback <onboarding@resend.dev>",
          to: [FEEDBACK_RECIPIENT],
          subject,
          html,
          text,
          // Lets the recipient hit "reply" and email the reporter directly,
          // without the reporter ever seeing the recipient's address.
          reply_to: reporterEmail ?? undefined,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("submit-feedback: Resend request failed", emailRes.status, errText);
        return Response.json({ error: "Failed to send feedback. Please try again later." }, { status: 502 });
      }
    } catch (err) {
      console.error("submit-feedback: unexpected error sending email", err);
      return Response.json({ error: "Failed to send feedback. Please try again later." }, { status: 500 });
    }

    return Response.json({ success: true }, { status: 200 });
  }),
};
