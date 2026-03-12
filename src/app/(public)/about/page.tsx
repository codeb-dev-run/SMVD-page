import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import {
  Header,
  Footer,
} from '@/components/public/home';
import AboutContent from './content';
import {
  asSectionContent,
  type AboutIntroContent,
  type AboutVisionContent,
  type AboutHistoryContent,
} from '@/types/domain/section-content';

/// Dynamic rendering: skip DB pre-render at Docker build time
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'About',
  description: '숙명여자대학교 시각영상디자인과 소개. 학과 비전, 역사, 교육 철학과 교수진 정보를 확인하세요.',
  keywords: ['시각영상디자인과 소개', '학과 비전', '교수진', '숙명여대 디자인', 'SMVD about'],
  openGraph: {
    title: 'About | 숙명여자대학교 시각영상디자인과',
    description: '숙명여자대학교 시각영상디자인과 소개. 학과 비전, 역사, 교육 철학과 교수진 정보를 확인하세요.',
    url: 'https://smvd.sookmyung.ac.kr/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | 숙명여자대학교 시각영상디자인과',
    description: '숙명여자대학교 시각영상디자인과 소개. 학과 비전, 역사, 교수진 정보.',
  },
};

export default async function AboutPage() {
  // Sections와 People을 병렬로 조회
  const [page, professors, instructors] = await Promise.all([
    prisma.page.findUnique({
      where: { slug: 'about' },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.people.findMany({
      where: { archivedAt: null, role: { not: 'instructor' } },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        title: true,
        role: true,
        office: true,
        email: true,
        phone: true,
        badge: true,
        profileImage: true,
        courses: true,
      },
    }),
    prisma.people.findMany({
      where: { archivedAt: null, role: 'instructor' },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        title: true,
        role: true,
        specialty: true,
      },
    }),
  ]);

  // Extract sections
  const introSection = page?.sections.find((s) => s.type === 'ABOUT_INTRO');
  const visionSection = page?.sections.find((s) => s.type === 'ABOUT_VISION');
  const historySection = page?.sections.find(
    (s) => s.type === 'ABOUT_HISTORY'
  );

  // Extract data from sections with proper types
  const introData = asSectionContent<AboutIntroContent>(introSection?.content);
  const visionData = asSectionContent<AboutVisionContent>(visionSection?.content);
  const historyData = asSectionContent<AboutHistoryContent>(historySection?.content);

  // People 데이터는 DB 테이블에서 직접 조회 (Section.content JSON 대신)
  const peopleData = {
    professors: professors.map((p) => ({
      id: p.id,
      name: p.name,
      title: p.title,
      office: p.office ?? undefined,
      email: p.email,
      phone: p.phone ?? undefined,
      badge: p.badge ?? undefined,
      profileImage: p.profileImage ?? undefined,
      courses: p.courses as { undergraduate: string[]; graduate: string[] } | undefined,
    })),
    instructors: instructors.map((i) => ({
      name: i.name,
      specialty: i.specialty ?? '',
    })),
  };

  return (
    <div>
      {/* Header */}
      <Header />

      {/* Content */}
      <AboutContent
        introData={introData}
        visionData={visionData}
        historyData={historyData}
        peopleData={peopleData}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
