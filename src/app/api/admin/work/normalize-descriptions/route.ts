import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { checkAdminAuth } from '@/lib/auth-check';

export const dynamic = 'force-dynamic';

interface NormalizeResult {
  slug: string;
  title: string;
  status: 'normalized' | 'skipped';
  preview?: string;
  reason?: string;
}

/**
 * POST /api/admin/work/normalize-descriptions
 * Normalize work project descriptions from BlockEditor JSON to plain text
 * Admin authentication required
 */
export async function POST() {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) return authResult.error;

    const projects = await prisma.workProject.findMany();
    const results: NormalizeResult[] = [];
    let normalizedCount = 0;

    for (const project of projects) {
      let cleanDescription = project.description;
      let wasNormalized = false;

      // Try to parse as BlockEditor JSON
      try {
        if (cleanDescription && typeof cleanDescription === 'string' && cleanDescription.trim().startsWith('{')) {
          const parsed = JSON.parse(cleanDescription);
          if (parsed?.blocks && Array.isArray(parsed.blocks)) {
            const textBlocks = parsed.blocks
              .filter((b: { type: string; content?: string }) => b.type === 'text' && b.content)
              .map((b: { content: string }) => b.content);

            if (textBlocks.length > 0) {
              cleanDescription = textBlocks.join('\n\n');
              wasNormalized = true;
            }
          }
        }
      } catch {
        // Not JSON or parse error - keep as is
      }

      if (wasNormalized) {
        await prisma.workProject.update({
          where: { id: project.id },
          data: { description: cleanDescription },
        });
        normalizedCount++;
        results.push({
          slug: project.slug,
          title: project.title,
          status: 'normalized',
          preview: cleanDescription?.substring(0, 60),
        });
      } else {
        results.push({
          slug: project.slug,
          title: project.title,
          status: 'skipped',
          reason: 'Already plain text or empty',
        });
      }
    }

    logger.info(
      { context: 'POST /api/admin/work/normalize-descriptions', normalizedCount },
      `Normalized ${normalizedCount}/${projects.length} descriptions`
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          totalProjects: projects.length,
          normalizedCount,
          results,
        },
        message: `Normalized ${normalizedCount} descriptions`,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(
      { err: error, context: 'POST /api/admin/work/normalize-descriptions' },
      'Description normalization error'
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
