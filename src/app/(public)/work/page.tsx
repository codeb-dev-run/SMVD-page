import type { Metadata } from 'next';
import {
  Header,
  Footer,
} from '@/components/public/home';
import { WorkArchive } from '@/components/public/work';
import { prisma } from '@/lib/db';

// ISR: regenerate every 5 minutes. Admin API calls revalidatePath() on mutations.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Work',
  description: '숙명여자대학교 시각영상디자인과 졸업작품 및 전시 아카이브. 학생들의 창의적인 시각·영상 디자인 작품을 소개합니다.',
  keywords: ['졸업작품', '디자인 작품', '전시', '시각디자인 포트폴리오', '숙명여대 작품', 'SMVD work', '아카이브'],
  openGraph: {
    title: 'Work | 숙명여자대학교 시각영상디자인과',
    description: '숙명여자대학교 시각영상디자인과 졸업작품 및 전시 아카이브. 학생들의 창의적인 시각·영상 디자인 작품을 소개합니다.',
    url: 'https://smvd.sookmyung.ac.kr/work',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work | 숙명여자대학교 시각영상디자인과',
    description: '숙명여자대학교 시각영상디자인과 졸업작품 및 전시 아카이브.',
  },
};

// Fetch work data from DB with fallback to hardcoded
async function getWorkData() {
  try {
    const [projects, exhibitions] = await Promise.all([
      prisma.workProject.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
      }),
      prisma.workExhibition.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    // Only return DB data if there are records
    if (projects.length > 0 || exhibitions.length > 0) {
      return {
        projects: projects.map((p) => ({
          id: p.slug,
          category: p.category,
          title: p.title,
          date: p.year,
          image: p.thumbnailImage,
          subtitle: p.subtitle,
        })),
        exhibitions: exhibitions.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.subtitle,
          image: e.image,
          artist: e.artist,
        })),
      };
    }
  } catch (error) {
    console.error('Work data fetch error:', error);
  }

  // Fallback: return null to use hardcoded data
  return null;
}

export default async function WorkPage() {
  const workData = await getWorkData();

  return (
    <div>
      {/* Header */}
      <Header />

      {/* Main Content Container */}
      <div
        style={{
          width: '100%',
          paddingTop: '0px',
          paddingBottom: '61px',
          paddingLeft: '40px',
          paddingRight: '40px',
          backgroundColor: '#ffffffff',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '100px',
          }}
        >
          {/* Work Archive Component */}
          <WorkArchive
            portfolioItemsFromDB={workData?.projects}
            exhibitionItemsFromDB={workData?.exhibitions}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
