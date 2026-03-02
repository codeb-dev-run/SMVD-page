import type { Metadata } from 'next';
import {
  Header,
  Footer,
} from '@/components/public/home';
import { NewsEventArchive } from '@/components/public/news';
import { prisma } from '@/lib/db';

// ISR: regenerate every 5 minutes. Admin API calls revalidatePath() on mutations.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'News & Event | SMVD',
  description: '시각영상디자인과 소식 및 행사',
  openGraph: {
    title: 'News & Event | SMVD',
    description: '시각영상디자인과 소식 및 행사',
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
      <div
        style={{
          width: '100%',
          boxSizing: 'border-box',
          paddingTop: '0px',
          paddingBottom: '61px',
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
          {/* News&Event Archive Component */}
          <NewsEventArchive items={newsItems} />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
