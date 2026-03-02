import type { Metadata } from 'next';
import {
  Header,
  Footer,
} from '@/components/public/home';
import { WorkDetailPage } from '@/components/public/work';
import { workDetails, WorkDetail, LEGACY_SLUG_MAP } from '@/constants/work-details';
import type { BlogContent } from '@/components/admin/shared/BlockEditor/types';
import { prisma } from '@/lib/db';
import { normalizeContentUrls, normalizeMediaUrl } from '@/lib/media-url';
import { notFound } from 'next/navigation';

// ISR: regenerate every 60 seconds. Admin API calls revalidatePath() on mutations.
export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const resolvedSlug = LEGACY_SLUG_MAP[id] ?? id;

  const project = await prisma.workProject.findFirst({
    where: { OR: [{ slug: resolvedSlug }, { id: resolvedSlug }], published: true },
    select: { title: true, description: true, thumbnailImage: true },
  });

  if (!project) return { title: 'Work | SMVD' };

  return {
    title: `${project.title} | SMVD`,
    description: project.description || '숙명여자대학교 시각영상디자인과 작품',
    openGraph: {
      title: `${project.title} | SMVD`,
      description: project.description || '숙명여자대학교 시각영상디자인과 작품',
      images: project.thumbnailImage ? [project.thumbnailImage] : [],
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  const projects = await prisma.workProject.findMany({
    select: { slug: true },
    where: { published: true },
  });
  
  const params = projects.map((project) => ({
    id: project.slug,
  }));

  // Legacy numeric slug paths for backward compatibility
  Object.keys(LEGACY_SLUG_MAP).forEach((oldSlug) => {
    params.push({ id: oldSlug });
  });

  return params;
}

async function getProjectFromDB(slug: string): Promise<WorkDetail | null> {
  try {
    const project = await prisma.workProject.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
        published: true,
      },
    });

    if (!project) return null;

    // Get all projects for prev/next navigation
    const allProjects = await prisma.workProject.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
      select: { slug: true, title: true, order: true },
    });

    const currentIndex = allProjects.findIndex((p) => p.slug === project.slug);
    const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : allProjects[allProjects.length - 1];
    const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : allProjects[0];

    const galleryImages = Array.isArray(project.galleryImages)
      ? (project.galleryImages as string[]).map((p) => normalizeMediaUrl(p) ?? p)
      : [];

    // Detect content format: Tiptap JSON or BlockEditor
    const contentObj = project.content && typeof project.content === 'object' ? project.content as Record<string, unknown> : null;
    const isTiptapContent = contentObj && contentObj.type === 'doc' && Array.isArray(contentObj.content);
    const isBlocksContent = contentObj && 'blocks' in contentObj && Array.isArray((contentObj as any).blocks);

    // Normalize all /uploads/ paths inside content JSON (server-side only)
    const normalizedContent = (isBlocksContent || isTiptapContent)
      ? normalizeContentUrls(contentObj) as unknown as BlogContent
      : null;

    return {
      id: project.slug,
      title: project.title,
      subtitle: project.subtitle,
      category: project.category,
      tags: project.tags,
      description: project.description,
      author: project.author,
      email: project.email,
      heroImage: normalizeMediaUrl(project.heroImage) ?? project.heroImage,
      galleryImages,
      content: normalizedContent,
      previousProject: prevProject
        ? { id: prevProject.slug, title: prevProject.title }
        : undefined,
      nextProject: nextProject
        ? { id: nextProject.slug, title: nextProject.title }
        : undefined,
    };
  } catch (error) {
    console.error('Work detail DB fetch error:', error);
    return null;
  }
}

export default async function WorkDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  // Resolve legacy numeric slug to new slug
  const resolvedSlug = LEGACY_SLUG_MAP[id] ?? id;

  // Try DB first, then fallback to hardcoded
  const project = (await getProjectFromDB(resolvedSlug)) ?? workDetails[resolvedSlug];

  if (!project) {
    notFound();
  }

  return (
    <div>
      <Header />
      <WorkDetailPage project={project} />
      <Footer />
    </div>
  );
}
