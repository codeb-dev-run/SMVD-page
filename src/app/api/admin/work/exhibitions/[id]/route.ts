import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth-check';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { z } from 'zod';
import { logger } from "@/lib/logger";

const UpdateExhibitionSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  artist: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  year: z.string().optional(),
  published: z.boolean().optional(),
  showOnHome: z.boolean().optional(),
});

/**
 * PUT /api/admin/work/exhibitions/:id
 * 전시 아이템 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) return authResult.error;

    const { id } = await params;
    const body = await request.json();

    const validation = UpdateExhibitionSchema.safeParse(body);
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

    const existing = await prisma.workExhibition.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('전시');
    }

    const updated = await prisma.workExhibition.update({
      where: { id },
      data: validation.data,
    });

    return successResponse(updated, '전시가 수정되었습니다');
  } catch (error) {
    console.error('전시 수정 오류:', error);
    return errorResponse('전시를 수정하는 중 오류가 발생했습니다', 'UPDATE_ERROR', 500);
  }
}

/**
 * DELETE /api/admin/work/exhibitions/:id
 * 전시 아이템 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) return authResult.error;

    const { id } = await params;

    const existing = await prisma.workExhibition.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('전시');
    }

    await prisma.workExhibition.delete({ where: { id } });

    return successResponse(null, '전시가 삭제되었습니다');
  } catch (error) {
    console.error('전시 삭제 오류:', error);
    return errorResponse('전시를 삭제하는 중 오류가 발생했습니다', 'DELETE_ERROR', 500);
  }
}
