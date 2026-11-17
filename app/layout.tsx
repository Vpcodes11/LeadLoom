import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leadloom — content funnels that turn interest into customers",
  description: "Plan and produce connected content funnels in your brand's voice: blogs, landing pages, emails, case studies and social posts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
