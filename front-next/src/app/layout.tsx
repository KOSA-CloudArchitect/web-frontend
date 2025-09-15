import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientWrapper } from "../components/providers/ClientWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "쿠팡 리뷰 분석 서비스",
  description: "AI가 분석한 쿠팡 상품 리뷰를 한눈에 확인하세요",
  keywords: ["쿠팡", "리뷰", "분석", "AI", "상품", "구매"],
  authors: [{ name: "KOSA Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script src="/env.js" defer></script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
