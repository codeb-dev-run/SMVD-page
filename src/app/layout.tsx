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
      title: {
        default: '숙명여자대학교 시각영상디자인과',
        template: '%s | 숙명여자대학교 시각영상디자인과',
      },
      description: '숙명여자대학교 시각영상디자인과 공식 웹사이트. 서울 용산구 위치, 학부·대학원 교육과정, 교수진, 졸업작품, 전시 정보를 제공합니다.',
      keywords: ['숙명여대', '시각영상디자인과', '숙명여자대학교', 'SMVD', '시각디자인', '영상디자인', '디자인학과', '서울 디자인대학', '용산'],
      icons: {
        icon: faviconPath,
        apple: faviconPath,
      },
      openGraph: {
        title: '숙명여자대학교 시각영상디자인과',
        description: '숙명여자대학교 시각영상디자인과 공식 웹사이트. 서울 용산구 위치, 학부·대학원 교육과정, 교수진, 졸업작품, 전시 정보를 제공합니다.',
        url: 'https://smvd.sookmyung.ac.kr',
        siteName: '숙명여자대학교 시각영상디자인과',
        locale: 'ko_KR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: '숙명여자대학교 시각영상디자인과',
        description: '숙명여자대학교 시각영상디자인과 공식 웹사이트. 서울 용산구 위치, 학부·대학원 교육과정, 교수진, 졸업작품, 전시 정보를 제공합니다.',
      },
    };
  } catch {
    return {
      title: {
        default: '숙명여자대학교 시각영상디자인과',
        template: '%s | 숙명여자대학교 시각영상디자인과',
      },
      description: '숙명여자대학교 시각영상디자인과 공식 웹사이트. 서울 용산구 위치, 학부·대학원 교육과정, 교수진, 졸업작품, 전시 정보를 제공합니다.',
      keywords: ['숙명여대', '시각영상디자인과', '숙명여자대학교', 'SMVD', '시각디자인', '영상디자인', '디자인학과', '서울 디자인대학', '용산'],
      icons: {
        icon: "/favicon.ico",
        apple: "/favicon.ico",
      },
      openGraph: {
        title: '숙명여자대학교 시각영상디자인과',
        description: '숙명여자대학교 시각영상디자인과 공식 웹사이트. 서울 용산구 위치, 학부·대학원 교육과정, 교수진, 졸업작품, 전시 정보를 제공합니다.',
        url: 'https://smvd.sookmyung.ac.kr',
        siteName: '숙명여자대학교 시각영상디자인과',
        locale: 'ko_KR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: '숙명여자대학교 시각영상디자인과',
        description: '숙명여자대학교 시각영상디자인과 공식 웹사이트. 서울 용산구 위치, 학부·대학원 교육과정, 교수진, 졸업작품, 전시 정보를 제공합니다.',
      },
    };
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://smvd.sookmyung.ac.kr/#organization',
      name: '숙명여자대학교 시각영상디자인과',
      alternateName: ['SMVD', 'Sookmyung Women\'s University Visual Media Design'],
      url: 'https://smvd.sookmyung.ac.kr',
      logo: 'https://smvd.sookmyung.ac.kr/favicon.ico',
      description: '숙명여자대학교 시각영상디자인과. 디지털 시대의 창의적 시각 표현을 교육하는 학과입니다.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '청파로47길 100',
        addressLocality: '용산구',
        addressRegion: '서울특별시',
        postalCode: '04310',
        addressCountry: 'KR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 37.5457,
        longitude: 126.9643,
      },
      parentOrganization: {
        '@type': 'CollegeOrUniversity',
        name: '숙명여자대학교',
        url: 'https://www.sookmyung.ac.kr',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://smvd.sookmyung.ac.kr/#website',
      url: 'https://smvd.sookmyung.ac.kr',
      name: '숙명여자대학교 시각영상디자인과',
      publisher: {
        '@id': 'https://smvd.sookmyung.ac.kr/#organization',
      },
      inLanguage: 'ko-KR',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
