import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
});

const crownIcon =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="52">👑</text></svg>`,
  );

export const metadata: Metadata = {
  title: "Naren",
  description: "Local-first personal tracking workspace",
  icons: {
    icon: crownIcon,
    shortcut: crownIcon,
    apple: crownIcon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={onest.variable}>{children}</body>
    </html>
  );
}
