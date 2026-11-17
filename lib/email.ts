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
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Inter,sans-serif;color:#0f172a">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
<div style="font-weight:700;font-size:18px;margin-bottom:24px"><span style="display:inline-block;background:#1f55e6;color:#fff;border-radius:6px;width:24px;height:24px;text-align:center;line-height:24px;margin-right:6px">L</span>Leadloom</div>
<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
<h1 style="font-size:20px;margin:0 0 12px">${esc(title)}</h1>
${paragraphs.map((p) => `<p style="font-size:15px;line-height:1.6;margin:0 0 12px;color:#334155">${esc(p)}</p>`).join("")}
${cta ? `<p style="margin:20px 0 0"><a href="${esc(cta.url)}" style="background:#1f55e6;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;display:inline-block">${esc(cta.label)}</a></p>` : ""}
</div>
<p style="font-size:12px;color:#94a3b8;margin-top:16px">You received this because you have a Leadloom account.</p>
</div></body></html>`;
}
