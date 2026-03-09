import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth, checkAdminAuthFast } from '@/lib/auth-check';
import {
  successResponse,
  errorResponse,
} from '@/lib/api-response';
import { z } from 'zod';
import { logger } from "@/lib/logger";

const CreateExhibitionSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  subtitle: z.string().min(1, '부제는 필수입니다'),
  artist: z.string().min(1, '작가명은 필수입니다'),
  image: z.string().min(1, '이미지는 필수입니다'),
  year: z.string().default('2025'),
  published: z.boolean().default(true),
  showOnHome: z.boolean().default(false),
});

/**
 * GET /api/admin/work/exhibitions
 * Work 전시 아이템 전체 조회
 */
export async function GET(request: Request) {
  try {
    const authResult = await checkAdminAuthFast(request);
    if (!authResult.authenticated) return authResult.error;

    const exhibitions = await prisma.workExhibition.findMany({
      orderBy: { order: 'asc' },
    });

    return successResponse(exhibitions, '전시 목록 조회 성공');
  } catch (error) {
    logger.error({ err: error, context: 'GET /api/admin/work/exhibitions' }, '전시 조회 오류');
    return errorResponse('전시 목록을 불러오는 중 오류가 발생했습니다', 'FETCH_ERROR', 500);
  }
}

/**
 * POST /api/admin/work/exhibitions
 * 새 전시 아이템 생성
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) return authResult.error;

    const body = await request.json();
    const validation = CreateExhibitionSchema.safeParse(body);

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

    const lastExhibition = await prisma.workExhibition.findFirst({
      orderBy: { order: 'desc' },
    });
    const nextOrder = lastExhibition ? lastExhibition.order + 1 : 0;

    const exhibition = await prisma.workExhibition.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        artist: data.artist,
        image: data.image,
        year: data.year,
        order: nextOrder,
        published: data.published,
        showOnHome: data.showOnHome,
      },
    });

    return successResponse(exhibition, '전시가 생성되었습니다', 201);
  } catch (error) {
    logger.error({ err: error, context: 'POST /api/admin/work/exhibitions' }, '전시 생성 오류');
    return errorResponse('전시를 생성하는 중 오류가 발생했습니다', 'CREATE_ERROR', 500);
  }
}
