import type { Metadata } from "next";
import { Inter, Fraunces, DM_Serif_Display, EB_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif-alt",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif-dusk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const markIcon =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#141414" stroke-width="3"/><circle cx="32" cy="32" r="7" fill="#E8612C"/></svg>`,
  );

export const metadata: Metadata = {
  title: "Focus",
  description: "Local-first personal tracking workspace",
  icons: {
    icon: markIcon,
    shortcut: markIcon,
    apple: markIcon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} ${dmSerif.variable} ${ebGaramond.variable} ${jetbrainsMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
