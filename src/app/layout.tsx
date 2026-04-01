import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KS Chess — Local Two-Player Chess",
  description: "A polished local two-player chess game by Kinnear Systems. Play chess with a friend on the same device.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>♟</text></svg>" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
