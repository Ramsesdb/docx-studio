import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocxStudio - AI-Powered DOCX Editor",
  description: "Edit Word documents with AI assistance. Preserve styles, replace text, and modify formatting using natural language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
