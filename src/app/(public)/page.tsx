import { prisma } from '@/lib/db';
import { Header, VideoHero } from '@/components/public/home';
import HomePageContent from './HomePageContent';
import { normalizeMediaUrl } from '@/lib/media-url';

// ISR: regenerate every 60 seconds. Admin API calls revalidatePath() on mutations.
export const revalidate = 60;

export const metadata = {
  title: '숙명여자대학교 시각영상디자인과',
  description: '숙명여자대학교 시각영상디자인과 공식 웹사이트. 서울 용산구 위치, 학부·대학원 교육과정, 교수진, 졸업작품, 전시 정보를 제공합니다.',
  keywords: ['숙명여대', '시각영상디자인과', 'SMVD', '숙명여자대학교', '시각디자인', '영상디자인', '디자인학과'],
  openGraph: {
    title: '숙명여자대학교 시각영상디자인과',
    description: '숙명여자대학교 시각영상디자인과 공식 웹사이트. 서울 용산구 위치, 학부·대학원 교육과정, 교수진, 졸업작품, 전시 정보를 제공합니다.',
    url: 'https://smvd.sookmyung.ac.kr',
  },
  twitter: {
    card: 'summary_large_image',
    title: '숙명여자대학교 시각영상디자인과',
    description: '숙명여자대학교 시각영상디자인과 공식 웹사이트.',
  },
};

export default async function HomePage() {
  try {
    const [page, navigationItems, headerConfig, footer, homeExhibitions] = await Promise.all([
      prisma.page.findUnique({
        where: { slug: 'home' },
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: {
              workPortfolios: {
                orderBy: { order: 'asc' },
                include: {
                  media: true,
                  workProject: { select: { slug: true } },
                },
              },
            },
          },
        },
      }),
      prisma.navigation.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      prisma.headerConfig.findFirst({
        include: {
          logoImage: true,
          faviconImage: true,
        },
      }),
      prisma.footer.findFirst(),
      prisma.workExhibition.findMany({
        where: { published: true, showOnHome: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    // Extract sections
    const workSection = page?.sections.find(
      (s) => s.type === 'WORK_PORTFOLIO'
    );
    const aboutSection = page?.sections.find(
      (s) => s.type === 'HOME_ABOUT'
    );

    // Map exhibition items from WorkExhibition (showOnHome=true)
    const exhibitionItems = homeExhibitions.map((item) => ({
      year: item.year,
      src: item.image,
      alt: item.title,
      title: item.title,
    }));

    // Map work portfolios to component props
    const workItems = workSection?.workPortfolios?.map((item) => ({
      src: normalizeMediaUrl(item.media?.filepath) || '',
      alt: item.media?.filename || item.title,
      title: item.title,
      category: item.category,
      slug: item.workProject?.slug ?? null,
    })) || [];

    // Extract about content
    const aboutContent = typeof aboutSection?.content === 'object' && aboutSection?.content
      ? (aboutSection.content as Record<string, unknown>)?.description as string || ''
      : '';

    // Map navigation items
    const navigation = navigationItems.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      order: item.order,
      isActive: item.isActive,
      parentId: item.parentId,
    }));

    // Map header config
    const headerConfigData = headerConfig
      ? {
          logoImagePath: headerConfig.logoImage?.filepath?.startsWith("http") ? headerConfig.logoImage.filepath : null,
          faviconImagePath: headerConfig.faviconImage?.filepath?.startsWith("http") ? headerConfig.faviconImage.filepath : null,
        }
      : undefined;

    // Map footer data
    const footerData = footer
      ? {
          title: footer.title,
          description: footer.description ?? undefined,
          address: footer.address ?? undefined,
          phone: footer.phone ?? undefined,
          email: footer.email ?? undefined,
        }
      : undefined;

    // Parse social links
    const socialLinks = footer?.socialLinks as
      | Record<string, { url: string; isActive: boolean }>
      | null
      | undefined;

    return (
      <HomePageContent
        exhibitionItems={exhibitionItems}
        workItems={workItems}
        aboutContent={aboutContent}
        navigation={navigation}
        headerConfig={headerConfigData}
        footerData={footerData}
        socialLinks={socialLinks ?? undefined}
      />
    );
  } catch (error) {
    console.error('Home page load error:', error);

    return (
      <HomePageContent
        exhibitionItems={[]}
        workItems={[]}
        aboutContent=""
      />
    );
  }
}
