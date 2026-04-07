import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wall Calendar — Interactive",
  description:
    "A polished, interactive wall-calendar component with date range selection and notes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
