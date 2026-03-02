import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { prisma } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const headerConfig = await prisma.headerConfig.findFirst({
      include: { faviconImage: true },
    });

    const rawFavicon = headerConfig?.faviconImage?.filepath;
    // Only use DB favicon if it's a full URL (Blob storage); relative paths 404 after migration
    const faviconPath = rawFavicon?.startsWith("http") ? rawFavicon : "/favicon.ico";

    return {
      title: "숙명여자대학교 시각영상디자인과 CMS",
      description: "숙명여자대학교 시각영상디자인과 웹사이트 CMS",
      keywords: ["숙명여대", "시각영상디자인과", "CMS"],
      icons: {
        icon: faviconPath,
        apple: faviconPath,
      },
      openGraph: {
        title: '숙명여자대학교 시각영상디자인과',
        description: '디지털 시대의 창의적 시각 표현을 주도하는 학과',
        url: 'https://smvd.sookmyung.ac.kr',
        siteName: '숙명여자대학교 시각영상디자인과',
        locale: 'ko_KR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: '숙명여자대학교 시각영상디자인과',
        description: '디지털 시대의 창의적 시각 표현을 주도하는 학과',
      },
    };
  } catch {
    return {
      title: "숙명여자대학교 시각영상디자인과 CMS",
      description: "숙명여자대학교 시각영상디자인과 웹사이트 CMS",
      keywords: ["숙명여대", "시각영상디자인과", "CMS"],
      icons: {
        icon: "/favicon.ico",
        apple: "/favicon.ico",
      },
      openGraph: {
        title: '숙명여자대학교 시각영상디자인과',
        description: '디지털 시대의 창의적 시각 표현을 주도하는 학과',
        url: 'https://smvd.sookmyung.ac.kr',
        siteName: '숙명여자대학교 시각영상디자인과',
        locale: 'ko_KR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: '숙명여자대학교 시각영상디자인과',
        description: '디지털 시대의 창의적 시각 표현을 주도하는 학과',
      },
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
