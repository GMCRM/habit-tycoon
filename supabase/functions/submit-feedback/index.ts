// Supabase Edge Function: submit-feedback
//
// Receives a bug report or feature request from the app and emails it to
// the developer. The recipient address is intentionally only ever
// referenced here, server-side — it is never sent to or stored in any
// client-facing code, so end users never see it.
//
// Required secrets (set with `supabase secrets set --project-ref <ref> KEY=value`):
//   RESEND_API_KEY   API key for https://resend.com used to send the email.
//
// Deploy with: supabase functions deploy submit-feedback
//
// Auth: this function requires a valid Supabase user JWT (the platform
// default `verify_jwt = true` applies since no override exists in
// config.toml), and the handler independently re-verifies the caller's
// identity below before doing anything else.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const FEEDBACK_RECIPIENT = 'grantmatai@gmail.com';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Hard ceilings enforced server-side, independent of any client-side limits.
const MAX_SHORT_FIELD = 1000;
const MAX_LONG_FIELD = 2000;
const MAX_REQUEST_BYTES = 20000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Escapes text for safe placement inside an HTML document body. Combined
// with the fact that every user-supplied value below is only ever placed
// in the HTML *body* (never in an attribute, URL, or the email's headers),
// this closes off script/markup injection into the outgoing email.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Trims, caps length, and rejects anything that isn't a plain string.
// Also drops non-printable control characters (keeping tab and newline so
// multi-line input still reads naturally) so the payload stays plain text.
// That in turn is what rules out things like header-injection style tricks
// if this value were ever reused somewhere more sensitive than a body.
function sanitizeField(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';

  const TAB = 9;
  const NEWLINE = 10;
  const SPACE = 32;
  const DEL = 127;

  let cleaned = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    const isDisallowedControl = (code < SPACE && code !== TAB && code !== NEWLINE) || code === DEL;
    if (!isDisallowedControl) {
      cleaned += ch;
    }
  }

  return cleaned.trim().slice(0, maxLength);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!RESEND_API_KEY) {
    console.error('submit-feedback: RESEND_API_KEY is not configured');
    return jsonResponse({ error: 'Feedback delivery is not configured.' }, 500);
  }

  // Reject oversized bodies outright before any parsing.
  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: 'Request too large.' }, 413);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Not authenticated.' }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return jsonResponse({ error: 'Not authenticated.' }, 401);
  }

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > MAX_REQUEST_BYTES) {
      return jsonResponse({ error: 'Request too large.' }, 413);
    }
    body = JSON.parse(raw);
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  if (!body || typeof body !== 'object') {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  const type = body['type'];
  if (type !== 'bug' && type !== 'feature') {
    return jsonResponse({ error: 'Invalid feedback type.' }, 400);
  }

  let subject: string;
  let sections: { label: string; value: string }[];

  if (type === 'bug') {
    const stepsToReproduce = sanitizeField(body['stepsToReproduce'], MAX_LONG_FIELD);
    const expectedResult = sanitizeField(body['expectedResult'], MAX_SHORT_FIELD);
    const actualResult = sanitizeField(body['actualResult'], MAX_SHORT_FIELD);

    if (!stepsToReproduce || !expectedResult || !actualResult) {
      return jsonResponse({ error: 'Please fill in all fields.' }, 400);
    }

    subject = 'Habit Tycoon Bug Report';
    sections = [
      { label: 'Steps to Reproduce', value: stepsToReproduce },
      { label: 'Expected Result', value: expectedResult },
      { label: 'Actual Result', value: actualResult },
    ];
  } else {
    const details = sanitizeField(body['details'], MAX_LONG_FIELD);
    if (!details) {
      return jsonResponse({ error: 'Please describe the feature.' }, 400);
    }

    subject = 'Habit Tycoon Feature Request';
    sections = [{ label: 'Feature Idea', value: details }];
  }

  // The reporter identity comes from the verified session, never from the
  // request body, so it can't be spoofed by the caller.
  const reporterEmail = userData.user.email ?? null;
  const reporterId = userData.user.id;

  const htmlSections = sections
    .map(
      (s) =>
        '<h3 style="margin:16px 0 4px;font-family:sans-serif;">' + escapeHtml(s.label) + '</h3>' +
        '<p style="white-space:pre-wrap;margin:0;font-family:sans-serif;">' + escapeHtml(s.value) + '</p>'
    )
    .join('');

  const html =
    '<div style="font-family:sans-serif;color:#1a1a1a;">' +
    '<p><strong>Reporter:</strong> ' + escapeHtml(reporterEmail ?? 'unknown') + ' (' + escapeHtml(reporterId) + ')</p>' +
    htmlSections +
    '</div>';

  const text =
    'Reporter: ' + (reporterEmail ?? 'unknown') + ' (' + reporterId + ')\n\n' +
    sections.map((s) => s.label + ':\n' + s.value).join('\n\n');

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Habit Tycoon Feedback <onboarding@resend.dev>',
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
      console.error('submit-feedback: Resend request failed', emailRes.status, errText);
      return jsonResponse({ error: 'Failed to send feedback. Please try again later.' }, 502);
    }
  } catch (err) {
    console.error('submit-feedback: unexpected error sending email', err);
    return jsonResponse({ error: 'Failed to send feedback. Please try again later.' }, 500);
  }

  return jsonResponse({ success: true }, 200);
});
