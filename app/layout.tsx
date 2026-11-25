import type { Metadata } from "next";
import "./globals.css";

const description = "Plan and produce connected content funnels in your brand's voice: blogs, landing pages, email sequences, case studies and social posts. Quality-checked, client-approved, delivered.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: "Leadloom — content funnels that turn interest into customers",
  description,
  openGraph: { type: "website", siteName: "Leadloom", title: "Leadloom — content funnels that turn interest into customers", description },
  twitter: { card: "summary_large_image", title: "Leadloom", description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
