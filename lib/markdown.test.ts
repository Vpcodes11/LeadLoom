import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "./markdown";

const dangerous = [
  "[click](javascript:alert(1))",
  "[c](JaVaScRiPt:alert(1))",
  "[c](java\tscript:alert(1))",
  "[c](%20javascript:alert(1))",
  "[c](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)",
  "[c](vbscript:msgbox(1))",
  "![x](javascript:alert(1))",
  "<javascript:alert(1)>",
  "<script>alert(1)</script>",
  "<img src=x onerror=alert(1)>",
  "[c](//evil.example/x)",
];

test("never renders script-capable links, images or raw HTML", () => {
  for (const src of dangerous) {
    const html = renderMarkdown(src).toLowerCase();
    assert.ok(!/href="\s*(javascript|data|vbscript)|src="\s*(javascript|data)|<script|<img[^>]*onerror|href="\/\//.test(html), `${src} → ${html}`);
  }
});

test("keeps normal links and marks external ones", () => {
  const html = renderMarkdown("[Book](https://greenleaf.example/book) · [Pricing](/pricing) · [Mail](mailto:a@b.co) · [Top](#top)");
  assert.match(html, /href="https:\/\/greenleaf\.example\/book" rel="noopener noreferrer nofollow" target="_blank"/);
  assert.match(html, /href="\/pricing"/);
  assert.match(html, /href="mailto:a@b\.co"/);
  assert.match(html, /href="#top"/);
});

test("titles cannot break out of the attribute", () => {
  const html = renderMarkdown('[ok](https://example.com "t\\" onmouseover=alert(1) x=\\"")');
  assert.ok(!/" onmouseover=/.test(html), html);
});
