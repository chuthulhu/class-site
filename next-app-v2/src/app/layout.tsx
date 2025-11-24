import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "교사 관리 포털",
  description: "과제 제출 현황 및 학생 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased bg-gray-50 min-h-screen"
        style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
