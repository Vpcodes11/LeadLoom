import { Marked } from "marked";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Raw HTML inside content is shown as text, never executed (content is shown to clients).
const md = new Marked({ gfm: true, breaks: true }); // keep single line breaks (email Subject/Preview lines)
md.use({ renderer: { html: ({ text }) => esc(text) } });

export function renderMarkdown(src: string) {
  return md.parse(src, { async: false }) as string;
}
