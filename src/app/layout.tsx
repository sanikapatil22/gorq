import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Restoration - Antique Restorer",
  description: "Restore old, rusted, and broken antique items to their original fresh look",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
