import "server-only";

/**
 * Transactional email through Resend's HTTP API (https://resend.com).
 * Without RESEND_API_KEY nothing is sent and the message is logged, so the app still works in development.
 */
export async function sendEmail(to: string | string[], subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Leadloom <onboarding@resend.dev>";
  if (!key) {
    console.log(`[email skipped: RESEND_API_KEY not set] to=${to} subject="${subject}"`);
    return { sent: false as const };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], subject, html }),
    });
    if (!res.ok) {
      console.error(`[email failed] ${res.status} ${await res.text()}`);
      return { sent: false as const };
    }
    return { sent: true as const };
  } catch (e) {
    console.error("[email failed]", e);
    return { sent: false as const };
  }
}

export const emailEnabled = () => Boolean(process.env.RESEND_API_KEY);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Minimal, client-safe HTML layout. All dynamic text is escaped. */
export function layout(title: string, paragraphs: string[], cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f3eee4;font-family:-apple-system,Segoe UI,Inter,sans-serif;color:#1c1a17">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;margin-bottom:24px"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#e2a13c;margin-right:8px;vertical-align:middle"></span>Leadloom</div>
<div style="background:#fff;border:1px solid rgba(28,26,23,.1);border-radius:18px;padding:24px">
<h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:28px;margin:0 0 12px">${esc(title)}</h1>
${paragraphs.map((p) => `<p style="font-size:15px;line-height:1.6;margin:0 0 12px;color:#57524a">${esc(p)}</p>`).join("")}
${cta ? `<p style="margin:20px 0 0"><a href="${esc(cta.url)}" style="background:#1c1a17;color:#fffaf0;text-decoration:none;padding:11px 20px;border-radius:999px;font-weight:600;display:inline-block">${esc(cta.label)}</a></p>` : ""}
</div>
<p style="font-size:12px;color:#8a8378;margin-top:16px">You received this because you have a Leadloom account.</p>
</div></body></html>`;
}
