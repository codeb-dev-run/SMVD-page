import { prisma } from '@/lib/db';
import { Header, VideoHero } from '@/components/public/home';
import HomePageContent from './HomePageContent';
import { normalizeMediaUrl } from '@/lib/media-url';

// ISR: regenerate every 60 seconds. Admin API calls revalidatePath() on mutations.
export const revalidate = 60;

export const metadata = {
  title: '숙명여자대학교 시각영상디자인과',
  description: '숙명여자대학교 시각영상디자인과 공식 웹사이트',
};

export default async function HomePage() {
  try {
    const [page, navigationItems, headerConfig, footer] = await Promise.all([
      prisma.page.findUnique({
        where: { slug: 'home' },
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: {
              exhibitionItems: {
                orderBy: { order: 'asc' },
                include: { media: true },
              },
              // workPortfolios fetched separately — the work_project_id column
              // may not exist on production DB if migration hasn't been applied yet.
              // Prisma default-selects all scalar fields, which would cause a query error.
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
    ]);

    // Extract sections
    const exhibitionSection = page?.sections.find(
      (s) => s.type === 'EXHIBITION_SECTION'
    );
    const workSection = page?.sections.find(
      (s) => s.type === 'WORK_PORTFOLIO'
    );
    const aboutSection = page?.sections.find(
      (s) => s.type === 'HOME_ABOUT'
    );

    // Map exhibition items to component props
    const exhibitionItems = exhibitionSection?.exhibitionItems?.map((item) => ({
      year: item.year,
      src: normalizeMediaUrl(item.media?.filepath) || '',
      alt: item.media?.altText || item.media?.filename || `${item.year} exhibition`,
      title: item.media?.altText || `${item.year} Exhibition`,
    })) || [];

    // Fetch work portfolios separately with explicit select to avoid work_project_id column issue
    let workPortfolioRows: Array<{ id: string; title: string; category: string; media: { filepath: string | null; filename: string } | null }> = [];
    if (workSection?.id) {
      try {
        workPortfolioRows = await prisma.workPortfolio.findMany({
          where: { sectionId: workSection.id },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            category: true,
            media: { select: { filepath: true, filename: true } },
          },
        });
      } catch {
        // Fallback if work_portfolios table has schema mismatch
      }
    }

    // Try to fetch workProject slugs (may fail if migration not applied)
    let slugMap: Record<string, string> = {};
    if (workSection?.id) {
      try {
        const portfoliosWithProject = await prisma.workPortfolio.findMany({
          where: { sectionId: workSection.id },
          select: { id: true, workProject: { select: { slug: true } } },
        });
        for (const p of portfoliosWithProject) {
          if (p.workProject?.slug) slugMap[p.id] = p.workProject.slug;
        }
      } catch {
        // workProject relation may not exist yet — safe to ignore
      }
    }

    const workItems = workPortfolioRows.map((item) => ({
      src: normalizeMediaUrl(item.media?.filepath) || '',
      alt: item.media?.filename || item.title,
      title: item.title,
      category: item.category,
      slug: slugMap[item.id] ?? null,
    }));

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
