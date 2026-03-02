import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@/generated/prisma';
import { checkAdminAuth, checkAdminAuthFast } from '@/lib/auth-check';
import {
  successResponse,
  errorResponse,
} from '@/lib/api-response';
import { z } from 'zod';
import { invalidateNews } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { tiptapContentSchema, blockContentSchema } from '@/types/schemas/content-schemas';

const GallerySchema = z.object({
  main: z.string().default(''),
  layout: z.string().default('1+2+3'),
  centerLeft: z.string().default(''),
  centerRight: z.string().default(''),
  bottomLeft: z.string().default(''),
  bottomCenter: z.string().default(''),
  bottomRight: z.string().default(''),
}).optional();

// Legacy content format (introTitle, introText, gallery)
const LegacyContentSchema = z.object({
  introTitle: z.string().optional(),
  introText: z.string().optional(),
  gallery: GallerySchema,
});

// Content can be Tiptap JSON, block format, or legacy format
const ContentSchema = z.union([
  // Tiptap JSON format: { type: "doc", content: [...] }
  tiptapContentSchema.passthrough(),
  // Block format: { blocks: [...], version: "1.0" }
  blockContentSchema.extend({ version: z.string() }),
  // Legacy format: { introTitle, introText, gallery }
  LegacyContentSchema,
]).optional();

// Attachment schema for file metadata (NEW - 2026-02-16)
// Use passthrough to allow any shape since attachments are flexible
const AttachmentSchema = z.object({}).passthrough().optional();

const CreateArticleSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  category: z.enum(['Notice', 'Event', 'Lecture', 'Exhibition', 'Awards', 'Recruiting']),
  excerpt: z.string().optional(),
  thumbnailImage: z.string().default('/Group-27.svg'),
  content: ContentSchema,
  attachments: z.array(z.object({}).passthrough()).optional(), // Flexible array of attachment objects
  publishedAt: z.string().optional(),
  published: z.boolean().default(true),
});

/**
 * GET /api/admin/news/articles
 * 뉴스 게시글 전체 조회 (카테고리 필터 지원)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuthFast(request);
    if (!authResult.authenticated) return authResult.error;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where = category && category !== 'ALL'
      ? { category }
      : {};

    const articles = await prisma.newsEvent.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return successResponse(articles, '뉴스 목록 조회 성공');
  } catch (error) {
    logger.error({ err: error, context: 'GET /api/admin/news/articles' }, '뉴스 조회 오류');
    return errorResponse('뉴스 목록을 불러오는 중 오류가 발생했습니다', 'FETCH_ERROR', 500);
  }
}

/**
 * POST /api/admin/news/articles
 * 새 뉴스 게시글 생성
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) return authResult.error;

    const body = await request.json();
    const validation = CreateArticleSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return errorResponse(
        '입력값 검증 실패: ' +
          Object.entries(errors)
            .map(([k, v]) => `${k}: ${(v as string[])?.[0]}`)
            .join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const data = validation.data;

    // Get next order
    const lastArticle = await prisma.newsEvent.findFirst({
      orderBy: { order: 'desc' },
    });
    const nextOrder = lastArticle ? lastArticle.order + 1 : 0;

    // Generate slug from title (race condition safe)
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check existing slugs in a single batch query instead of sequential lookups
    const existingSlugs = await prisma.newsEvent.findMany({
      where: {
        slug: { startsWith: baseSlug },
      },
      select: { slug: true },
    });
    const slugSet = new Set(existingSlugs.map((a) => a.slug));

    let slug = baseSlug;
    let counter = 1;
    while (slugSet.has(slug) && counter <= 100) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    if (counter > 100) {
      return errorResponse(
        '유효한 slug를 생성할 수 없습니다',
        'SLUG_GENERATION_FAILED',
        500
      );
    }

    const article = await prisma.newsEvent.create({
      data: {
        slug,
        title: data.title,
        category: data.category,
        excerpt: data.excerpt || null,
        thumbnailImage: data.thumbnailImage,
        content: data.content ? (data.content as Prisma.InputJsonValue) : Prisma.JsonNull,
        attachments: data.attachments && data.attachments.length > 0
          ? (data.attachments as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        published: data.published,
        order: nextOrder,
      },
    });

    // Invalidate ISR caches
    invalidateNews();

    return successResponse(article, '뉴스가 생성되었습니다', 201);
  } catch (error) {
    logger.error({ err: error, context: 'POST /api/admin/news/articles' }, '뉴스 생성 오류');
    return errorResponse('뉴스를 생성하는 중 오류가 발생했습니다', 'CREATE_ERROR', 500);
  }
}
