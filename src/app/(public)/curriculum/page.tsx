import type { Metadata } from 'next';
import {
  Header,
  Footer,
} from '@/components/public/home';
import CurriculumContent from './content';
import { prisma } from '@/lib/db';
import { SectionType } from '@/generated/prisma';
import type { UndergraduateContent, GraduateContent } from '@/lib/validation/curriculum';

// ISR: regenerate every 10 minutes. Curriculum changes very infrequently.
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Curriculum | SMVD',
  description: '시각영상디자인과 교육과정',
  openGraph: {
    title: 'Curriculum | SMVD',
    description: '시각영상디자인과 교육과정',
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
