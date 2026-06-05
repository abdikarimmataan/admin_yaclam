import type { Metadata } from "next";
import { AdminShellWrapper } from "@/components/layout/AdminShellWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yaclam Admin",
  description: "Yaclam Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdminShellWrapper>{children}</AdminShellWrapper>
      </body>
    </html>
  );
}
