import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar Domače",
  description: "Provider portal and admin dashboard for local food discovery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
