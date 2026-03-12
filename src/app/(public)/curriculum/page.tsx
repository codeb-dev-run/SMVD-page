import type { Metadata } from 'next';
import {
  Header,
  Footer,
} from '@/components/public/home';
import CurriculumContent from './content';
import { prisma } from '@/lib/db';
import { SectionType } from '@/generated/prisma';
import type { UndergraduateContent, GraduateContent } from '@/lib/validation/curriculum';

/// Dynamic rendering: skip DB pre-render at Docker build time
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Curriculum',
  description: '숙명여자대학교 시각영상디자인과 교육과정. 학부 및 대학원 커리큘럼, 전공 과목, 이수 체계를 안내합니다.',
  keywords: ['시각영상디자인 교육과정', '커리큘럼', '전공과목', '숙명여대 디자인학과', '학부', '대학원'],
  openGraph: {
    title: 'Curriculum | 숙명여자대학교 시각영상디자인과',
    description: '숙명여자대학교 시각영상디자인과 교육과정. 학부 및 대학원 커리큘럼, 전공 과목, 이수 체계를 안내합니다.',
    url: 'https://smvd.sookmyung.ac.kr/curriculum',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curriculum | 숙명여자대학교 시각영상디자인과',
    description: '숙명여자대학교 시각영상디자인과 학부·대학원 교육과정 안내.',
  },
};

async function getCurriculumData() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'curriculum' },
      include: {
        sections: {
          where: {
            type: {
              in: [SectionType.CURRICULUM_UNDERGRADUATE, SectionType.CURRICULUM_GRADUATE],
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!page) return { undergraduate: null, graduate: null };

    let undergraduate: UndergraduateContent | null = null;
    let graduate: GraduateContent | null = null;

    for (const section of page.sections) {
      if (section.type === 'CURRICULUM_UNDERGRADUATE' && section.content) {
        undergraduate = section.content as unknown as UndergraduateContent;
      } else if (section.type === 'CURRICULUM_GRADUATE' && section.content) {
        graduate = section.content as unknown as GraduateContent;
      }
    }

    return { undergraduate, graduate };
  } catch (error) {
    console.error('Failed to fetch curriculum data:', error);
    return { undergraduate: null, graduate: null };
  }
}

export default async function CurriculumPage() {
  const { undergraduate, graduate } = await getCurriculumData();

  return (
    <div>
      {/* Header */}
      <Header />

      {/* Main Content Container */}
      <CurriculumContent
        undergraduateContent={undergraduate}
        graduateContent={graduate}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
