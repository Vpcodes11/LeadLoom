import { Marked } from "marked";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Only web, mail and phone links, plus same-site paths and anchors. Anything else
 * (javascript:, data:, vbscript:, file:, …) is dropped, because drafts are shown to clients
 * in the no-login review portal and their Markdown can come from teammates or the AI.
 */
export function safeUrl(href: string | null | undefined): string | null {
  if (!href) return null;
  // Browsers ignore control characters and whitespace inside a scheme ("java\tscript:"), so strip them first.
  const url = href.replace(/[\u0000- \u007f-\u009f]/g, "");
  if (/^(https?:|mailto:|tel:)/i.test(url)) return href.trim();
  if (/^(\/(?!\/)|#|\?)/.test(url)) return href.trim(); // same-site path, anchor or query
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith("//")) return href.trim(); // relative path like "page.html"
  return null;
}

// Raw HTML inside content is shown as text, never executed.
const md = new Marked({ gfm: true, breaks: true }); // keep single line breaks (email Subject/Preview lines)
md.use({
  renderer: {
    html: ({ text }) => esc(text),
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const url = safeUrl(href);
      if (!url) return text;
      const external = /^https?:/i.test(url);
      return `<a href="${esc(url)}"${title ? ` title="${esc(title)}"` : ""}${external ? ' rel="noopener noreferrer nofollow" target="_blank"' : ""}>${text}</a>`;
    },
    image({ href, title, text }) {
      const url = safeUrl(href);
      if (!url || !/^(https?:|\/)/i.test(url)) return esc(text);
      return `<img src="${esc(url)}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ""} loading="lazy">`;
    },
  },
});

export function renderMarkdown(src: string) {
  return md.parse(src, { async: false }) as string;
}
