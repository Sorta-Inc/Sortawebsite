/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Sends the partner-enquiry form (see src/components/Partner.tsx) to
 * hello@sorta.co.jp via Resend.
 *
 * Requires a RESEND_API_KEY environment variable / secret, set in the
 * Cloudflare Pages project's dashboard under
 * Settings -> Environment variables (do not commit it here).
 */

const REQUIRED_FIELDS = [
  "companyName",
  "industry",
  "location",
  "spaceType",
  "footfall",
  "contactName",
  "email",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Returns an error message string if invalid, otherwise null. */
function validate(data) {
  if (typeof data !== "object" || data === null) return "Invalid form data";

  for (const field of REQUIRED_FIELDS) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      return "Invalid form data";
    }
  }
  if (!EMAIL_RE.test(data.email)) return "Invalid form data";
  if (data.message !== undefined && typeof data.message !== "string") {
    return "Invalid form data";
  }

  return null;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHtml(data) {
  const rows = [
    ["Company", data.companyName],
    ["Industry", data.industry],
    ["Location", data.location],
    ["Space Type", data.spaceType],
    ["Footfall", data.footfall],
    ["Contact Name", data.contactName],
    ["Email", data.email],
    ["Message", data.message || "—"],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#4a5568;background:#f7fafc;white-space:nowrap;border:1px solid #e2e8f0">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;color:#1a202c;border:1px solid #e2e8f0">${escapeHtml(String(value))}</td>
        </tr>`,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1a202c;margin-bottom:4px">New partner enquiry</h2>
        <p style="color:#718096;margin-top:0">Submitted via sorta.co.jp</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          ${rowsHtml}
        </table>
        <p style="margin-top:24px;color:#718096;font-size:13px">
          Reply directly to this email to respond to ${escapeHtml(data.contactName)} at ${escapeHtml(data.email)}.
        </p>
      </body>
    </html>
  `;
}

export async function onRequestPost({ request, env }) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured");
    return jsonResponse({ ok: false, error: "Server misconfigured" }, 500);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid form data" }, 400);
  }

  const validationError = validate(data);
  if (validationError) {
    return jsonResponse({ ok: false, error: validationError }, 400);
  }

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Sorta <noreply@sorta.co.jp>",
        to: ["hello@sorta.co.jp"],
        reply_to: data.email,
        subject: `New partner enquiry — ${data.companyName}`,
        html: buildHtml(data),
      }),
    });

    if (!resendRes.ok) {
      const errorBody = await resendRes.text();
      console.error("Resend API error", resendRes.status, errorBody);
      return jsonResponse({ ok: false, error: "Failed to send email" }, 502);
    }

    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    console.error("Unexpected error sending contact email", err);
    return jsonResponse({ ok: false, error: "Internal server error" }, 500);
  }
}

// Only onRequestPost is exported: Cloudflare Pages Functions automatically
// responds 405 Method Not Allowed for any other HTTP method on this route.
