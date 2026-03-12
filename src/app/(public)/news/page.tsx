import type { Metadata } from 'next';
import {
  Header,
  Footer,
} from '@/components/public/home';
import { NewsEventArchive } from '@/components/public/news';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'News & Event',
  description: '숙명여자대학교 시각영상디자인과 최신 소식과 행사 안내. 공지사항, 이벤트, 강연, 전시, 수상 소식을 확인하세요.',
  keywords: ['시각영상디자인 소식', '공지사항', '이벤트', '전시', '강연', '수상', '숙명여대 뉴스', 'SMVD news'],
  openGraph: {
    title: 'News & Event | 숙명여자대학교 시각영상디자인과',
    description: '숙명여자대학교 시각영상디자인과 최신 소식과 행사 안내. 공지사항, 이벤트, 강연, 전시, 수상 소식을 확인하세요.',
    url: 'https://smvd.sookmyung.ac.kr/news',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News & Event | 숙명여자대학교 시각영상디자인과',
    description: '숙명여자대학교 시각영상디자인과 최신 소식과 행사 안내.',
  },
};

async function getNewsItems() {
  try {
    const articles = await prisma.newsEvent.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });

    if (articles.length > 0) {
      return articles.map((article) => ({
        id: article.slug,
        category: article.category,
        date: article.publishedAt
          ? new Date(article.publishedAt).toISOString().split('T')[0]
          : '2025-01-05',
        title: article.title,
        description: article.excerpt || '',
        image: article.thumbnailImage,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch news from DB:', error);
  }

  // Fallback to null (component will use hardcoded data)
  return null;
}

export default async function NewsPage() {
  const newsItems = await getNewsItems();

  return (
    <div>
      {/* Header */}
      <Header />

      {/* Main Content Container */}
      <div className="w-full max-w-[1440px] mx-auto pb-[61px] px-4 sm:px-6 lg:px-10 bg-[#ffffffff]">
        <div className="flex flex-col gap-[100px]">
          {/* News&Event Archive Component */}
          <NewsEventArchive items={newsItems} />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
