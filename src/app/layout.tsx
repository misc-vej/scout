import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scout",
  description: "Find something wild.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap"
        />
      </head>
      <body style={{ background: '#f5f0e4', minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
