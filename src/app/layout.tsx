import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "山间笔记",
  description: "记录技术、思考与生活的地方",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
