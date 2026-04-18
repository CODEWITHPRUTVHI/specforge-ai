import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpecForge AI — Your Execution Co-Founder",
  description:
    "SpecForge AI helps first-time founders get unstuck. Get a diagnosis, a TODAY action plan, and real resources — in seconds.",
  keywords: "startup, founder, AI, co-founder, execution, problem solving",
  openGraph: {
    title: "SpecForge AI — Your Execution Co-Founder",
    description: "Get unstuck. Move fast. Ship your startup.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
