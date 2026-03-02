import {
  Header,
  Footer,
} from '@/components/public/home';
import { NewsEventDetailContent } from '@/components/public/news';
import AttachmentDownloadBox from '@/components/public/news/AttachmentDownloadBox'; // NEW - 2026-02-16
import NewsDetailLayout from '@/components/public/news/NewsDetailLayout';
import NewsBlockDetailView from '@/components/public/news/NewsBlockDetailView';
import TiptapNewsDetailView from '@/components/public/news/TiptapNewsDetailView'; // NEW - 2026-02-19
import { prisma } from '@/lib/db';
import { normalizeContentUrls, normalizeMediaUrl } from '@/lib/media-url';

// ISR: regenerate every 60 seconds. Admin API calls revalidatePath() on mutations.
export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await prisma.newsEvent.findMany({
    select: { slug: true },
    where: { published: true },
  });
  
  return articles.map((article) => ({
    id: article.slug,
  }));
}

// ---- Types ----

interface AttachmentData {
  id: string;
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

interface NewsLegacyData {
  id: string;
  category: string;
  date: string;
  title: string;
  introTitle?: string;
  introText?: string;
  attachments?: AttachmentData[] | null; // NEW - 2026-02-16
  images?: {
    main: string;
    centerLeft: string;
    centerRight: string;
    bottomLeft: string;
    bottomCenter: string;
    bottomRight: string;
  };
}

interface NewsBlockData {
  id: string;
  category: string;
  date: string;
  title: string;
  blocks: Array<Record<string, unknown>>;
  version: string;
  attachments?: AttachmentData[] | null; // NEW - 2026-02-16
}

interface NewsTiptapData {
  id: string;
  category: string;
  date: string;
  title: string;
  content: Record<string, unknown>;
  attachments?: AttachmentData[] | null;
}

type NewsDetailResult =
  | { type: 'legacy'; data: NewsLegacyData }
  | { type: 'blocks'; data: NewsBlockData }
  | { type: 'tiptap'; data: NewsTiptapData }
  | null;

// ---- Data fetching ----

async function getNewsDetail(slug: string): Promise<NewsDetailResult> {
  try {
    const article = await prisma.newsEvent.findUnique({
      where: { slug },
    });

    if (article) {
      const content = article.content as Record<string, unknown> | null;

      const baseData = {
        id: article.slug,
        category: article.category,
        date: article.publishedAt
          ? new Date(article.publishedAt).toISOString().split('T')[0]
          : '2025-01-05',
        title: article.title,
        attachments: article.attachments as AttachmentData[] | null | undefined, // NEW - 2026-02-16
      };

      // Normalize attachments (server-side, before passing to client)
      // attachments may be a JSON string from DB - parse it first
      if (baseData.attachments && typeof baseData.attachments === 'string') {
        try {
          baseData.attachments = JSON.parse(baseData.attachments);
        } catch {
          baseData.attachments = null;
        }
      }
      if (Array.isArray(baseData.attachments)) {
        baseData.attachments = baseData.attachments.map((a) => ({
          ...a,
          filepath: normalizeMediaUrl(a.filepath) ?? a.filepath,
        }));
      }

      // Check if content is in Tiptap JSON format (NEW - 2026-02-19)
      if (
        content &&
        'type' in content &&
        content.type === 'doc' &&
        'content' in content &&
        Array.isArray(content.content)
      ) {
        return {
          type: 'tiptap',
          data: {
            ...baseData,
            content: normalizeContentUrls(content) as Record<string, unknown>,
          },
        };
      }

      // Check if content is in block format (has blocks[] array with items)
      if (
        content &&
        'blocks' in content &&
        Array.isArray(content.blocks) &&
        content.blocks.length > 0
      ) {
        return {
          type: 'blocks',
          data: {
            ...baseData,
            blocks: normalizeContentUrls(content.blocks) as Array<Record<string, unknown>>,
            version: (content.version as string) || '1.0',
          },
        };
      }

      // Legacy format (introTitle, introText, gallery)
      const gallery = content?.gallery as Record<string, string> | undefined;

      return {
        type: 'legacy',
        data: {
          ...baseData,
          introTitle: (content?.introTitle as string) || undefined,
          introText: (content?.introText as string) || undefined,
          images: gallery
            ? normalizeContentUrls({
                main: gallery.main || '',
                centerLeft: gallery.centerLeft || '',
                centerRight: gallery.centerRight || '',
                bottomLeft: gallery.bottomLeft || '',
                bottomCenter: gallery.bottomCenter || '',
                bottomRight: gallery.bottomRight || '',
              })
            : undefined,
        },
      };
    }
  } catch (error) {
    console.error('Failed to fetch news detail from DB:', error);
  }

  // Return null (component will use hardcoded data)
  return null;
}

// ---- Page component ----

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getNewsDetail(id);

  return (
    <div>
      {/* Header */}
      <Header />

      {/* Main Content Container - Responsive via client component */}
      <NewsDetailLayout>
        {result?.type === 'tiptap' ? (
          // NEW - 2026-02-19: Tiptap JSON content rendering
          <TiptapNewsDetailView data={result.data} />
        ) : result?.type === 'blocks' ? (
          // Block-based content rendering (responsive client component)
          <NewsBlockDetailView data={result.data} />
        ) : (
          // Legacy content rendering (or fallback to hardcoded)
          <>
            <NewsEventDetailContent
              itemId={id}
              dbData={result?.data ?? null}
            />
            {/* Attachment Download Box for legacy format (NEW - 2026-02-16) */}
            <AttachmentDownloadBox attachments={result?.data?.attachments} />
          </>
        )}
      </NewsDetailLayout>

      {/* Footer */}
      <Footer />
    </div>
  );
}

