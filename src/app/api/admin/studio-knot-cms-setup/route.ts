/**
 * PHASE 2 API: Studio Knot CMS Data Setup
 *
 * POST /api/admin/studio-knot-cms-setup
 *
 * Generates and saves BlogContent JSON for Studio Knot project
 * Requires admin authentication
 */

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { logger } from "@/lib/logger";
import { checkAdminAuth } from "@/lib/auth-check";

const studioKnotBlogContent = {
  version: "1.0",

  blocks: [
    // Block 0: Hero Image
    {
      id: "block-hero-knot-1",
      type: "hero-image",
      order: 0,
      url: "/images/work/knot/hero.png",
      alt: "STUDIO KNOT Hero Image",
      height: 600,
      objectFit: "cover"
    },

    // Block 1: Work Title (좌측)
    {
      id: "block-title-knot-1",
      type: "work-title",
      order: 1,
      title: "STUDIO KNOT",
      subtitle: "노하린, 2025",
      author: "노하린",
      email: "havein6@gmail.com",
      titleFontSize: 60,
      titleFontWeight: "700",
      titleColor: "#1b1d1f",
      subtitleFontSize: 14,
      subtitleFontWeight: "500",
      subtitleColor: "#7b828e",
      authorFontSize: 14,
      authorFontWeight: "500",
      authorColor: "#1b1d1f",
      emailFontSize: 12,
      emailFontWeight: "400",
      emailColor: "#7b828e",
      gap: 24
    },

    // Block 2: Text Description (우측)
    {
      id: "block-text-knot-1",
      type: "text",
      order: 2,
      content: "STUDIO KNOT는 입지 않는 옷에 새로운 쓰임을 더해 반려견 장난감으로 재탄생시키는 업사이클링 터그 토이 브랜드입니다. 쉽게 버려지는 의류와 빠르게 닳는 반려견 장난감의 순환 구조를 개선하며, 보호자의 체취가 남은 옷으로 만든 토이는 정서적 가치를 담은 지속가능한 대안을 제시합니다.",
      fontSize: 18,
      fontWeight: "400",
      fontFamily: "var(--font-suit), sans-serif",
      color: "#1b1d1f",
      lineHeight: 1.8,
      letterSpacing: 0.5
    },

    // Block 3: Image Grid (9개 이미지)
    {
      id: "block-gallery-knot-1",
      type: "image-grid",
      template: "auto",
      gap: 0,
      aspectRatio: 2,
      order: 3,
      images: [
        { id: "img-1", url: "/images/work/knot/gallery-1.png", alt: "Gallery 1" },
        { id: "img-2", url: "/images/work/knot/gallery-2.png", alt: "Gallery 2" },
        { id: "img-3", url: "/images/work/knot/gallery-3.png", alt: "Gallery 3" },
        { id: "img-4", url: "/images/work/knot/gallery-4.png", alt: "Gallery 4" },
        { id: "img-5", url: "/images/work/knot/gallery-5.png", alt: "Gallery 5" },
        { id: "img-6", url: "/images/work/knot/gallery-6.png", alt: "Gallery 6" },
        { id: "img-7", url: "/images/work/knot/gallery-7.png", alt: "Gallery 7" },
        { id: "img-8", url: "/images/work/knot/gallery-8.png", alt: "Gallery 8" },
        { id: "img-9", url: "/images/work/knot/gallery-9.png", alt: "Gallery 9" }
      ]
    }
  ],

  rowConfig: [
    { layout: 1, blockCount: 1 },
    { layout: 2, blockCount: 2 },
    { layout: 1, blockCount: 1 }
  ]
};

export async function POST() {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) return authResult.error;

    logger.info({ context: 'POST /api/admin/studio-knot-cms-setup' }, 'Finding Studio Knot project');
    const studioKnot = await prisma.workProject.findFirst({
      where: { title: "STUDIO KNOT" }
    });

    if (!studioKnot) {
      return NextResponse.json(
        { error: "Studio Knot project not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.workProject.update({
      where: { id: studioKnot.id },
      data: {
        content: studioKnotBlogContent as Prisma.InputJsonValue
      }
    });

    const contentData = updated.content as { blocks: unknown[]; rowConfig: unknown[]; } | null;
    return NextResponse.json({
      success: true,
      message: "Phase 2 Complete: Studio Knot CMS data saved",
      data: {
        projectId: updated.id,
        title: updated.title,
        blocks: contentData?.blocks.length ?? 0,
        rows: contentData?.rowConfig.length ?? 0,
        galleryImages: ((contentData?.blocks[3] as { images?: unknown[] })?.images?.length) ?? 0
      }
    });
  } catch (error) {
    logger.error({ err: error, context: 'POST /api/admin/studio-knot-cms-setup' }, 'Setup error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
