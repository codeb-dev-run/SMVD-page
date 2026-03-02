'use client';

import React from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeContent } from '@/lib/sanitize';

/**
 * Public-facing block renderer for news articles.
 * Renders block-based content (BlogContent format) in the public news detail page.
 *
 * Supported block types:
 * - hero-image: Full-width hero image
 * - text: Markdown text block with styling
 * - heading: H1/H2/H3 heading
 * - image: Single image with size/alignment
 * - image-grid: Multiple images in rows (1+2+3 layout etc.)
 * - gallery: Legacy gallery block (1+2+3 layout)
 * - spacer: Vertical spacing
 * - divider: Horizontal line
 */

// ---- Type definitions (inline to avoid importing from admin) ----

interface ImageData {
  id: string;
  url: string;
  alt?: string;
}

interface ImageGridRow {
  id: string;
  columns: 1 | 2 | 3;
  imageCount: number;
}

interface BlockBase {
  id: string;
  type: string;
  order: number;
}

// ---- Helpers ----

function hasMarkdownSyntax(text: string): boolean {
  if (!text) return false;
  return /[#*_~`\[\]!>-]/.test(text) && (
    /^#{1,6}\s/m.test(text) ||
    /\*\*.+?\*\*/m.test(text) ||
    /\[.+?\]\(.+?\)/m.test(text) ||
    /^[-*]\s/m.test(text) ||
    /^\d+\.\s/m.test(text) ||
    /^>/m.test(text)
  );
}

// ---- Individual block renderers ----

function HeroImageRenderer({ block }: { block: BlockBase & { url: string; alt: string } }) {
  if (!block.url) return null;

  return (
    <div
      style={{
        width: '100%',
        height: '765px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <Image
        src={block.url}
        alt={block.alt || 'Hero image'}
        width={1360}
        height={765}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1360px"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
}

function TextRenderer({ block }: { block: BlockBase & { content: string; fontSize?: number; fontWeight?: string; color?: string; lineHeight?: number } }) {
  if (!block.content) return null;

  const fontSize = block.fontSize ?? 18;
  const fontWeight = block.fontWeight ?? '500';
  const color = block.color ?? '#1b1d1f';
  const lineHeight = block.lineHeight ?? 1.5;

  if (hasMarkdownSyntax(block.content)) {
    return (
      <div
        style={{
          fontSize: `${fontSize}px`,
          fontWeight,
          fontFamily: 'Pretendard, sans-serif',
          color,
          lineHeight: `${lineHeight}`,
          letterSpacing: '-0.18px',
          wordBreak: 'keep-all',
        }}
        className="prose prose-lg max-w-none"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {sanitizeContent(block.content)}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <p
      style={{
        fontSize: `${fontSize}px`,
        fontWeight,
        fontFamily: 'Pretendard, sans-serif',
        color,
        margin: '0',
        lineHeight: `${lineHeight}`,
        letterSpacing: '-0.18px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'keep-all',
      }}
    >
      {block.content}
    </p>
  );
}

function HeadingRenderer({ block }: { block: BlockBase & { level: number; content: string } }) {
  const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3';
  const sizes = { 1: '48px', 2: '36px', 3: '24px' };

  return (
    <Tag
      style={{
        fontSize: sizes[block.level as 1 | 2 | 3] || '24px',
        fontWeight: '700',
        fontFamily: 'Pretendard, sans-serif',
        color: '#000',
        margin: '0',
        lineHeight: '1.45',
        letterSpacing: '-0.48px',
      }}
    >
      {block.content}
    </Tag>
  );
}

function ImageRenderer({ block }: { block: BlockBase & { url: string; alt: string; caption?: string; size: string } }) {
  if (!block.url) return null;

  const maxWidths: Record<string, string> = {
    small: '25%',
    medium: '50%',
    large: '75%',
    full: '100%',
  };

  return (
    <figure style={{ maxWidth: maxWidths[block.size] || '100%', margin: '0 auto' }}>
      <img
        src={block.url}
        alt={block.alt || ''}
        style={{ width: '100%', borderRadius: '4px' }}
      />
      {block.caption && (
        <figcaption
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#7b828e',
            marginTop: '8px',
          }}
        >
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function ImageGridRenderer({ block }: { block: BlockBase & { images: ImageData[]; rows: ImageGridRow[]; gap?: number; aspectRatio?: number } }) {
  const images = block.images || [];
  const gap = block.gap ?? 20;

  // Use provided rows, or auto-generate 1+2+3 layout
  let rows = block.rows || [];
  if (rows.length === 0 && images.length > 0) {
    let imgIdx = 0;
    const layoutStrategy = [
      { columns: 1 as const, count: 1 },
      { columns: 2 as const, count: 2 },
      { columns: 3 as const, count: 999 },
    ];
    for (const layout of layoutStrategy) {
      if (imgIdx >= images.length) break;
      const count = Math.min(layout.count, images.length - imgIdx);
      rows.push({
        id: `auto-row-${rows.length}`,
        columns: layout.columns,
        imageCount: count,
      });
      imgIdx += count;
    }
  }

  let imageIdx = 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`,
        width: '100%',
      }}
    >
      {rows.map((row) => {
        const rowImages: ImageData[] = [];
        for (let i = 0; i < row.imageCount && imageIdx < images.length; i++) {
          rowImages.push(images[imageIdx]);
          imageIdx++;
        }

        return (
          <div
            key={row.id}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${row.columns}, 1fr)`,
              gap: `${gap}px`,
              width: '100%',
            }}
          >
            {rowImages.map((img, imgIdx) => (
              <div
                key={img.id || `${row.id}-${imgIdx}`}
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  aspectRatio: block.aspectRatio ? `${block.aspectRatio}` : undefined,
                  lineHeight: '0',
                }}
              >
                <img
                  src={img.url}
                  alt={img.alt || `Gallery image ${imgIdx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function GalleryRenderer({ block }: { block: BlockBase & { images: { id: string; url: string; alt?: string }[]; layout?: string } }) {
  const images = block.images || [];
  if (images.length === 0) return null;

  // Use 1+2+3 layout by default
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
      }}
    >
      {/* Main image (full width) */}
      {images[0] && (
        <div
          style={{
            width: '100%',
            height: '765px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <img
            src={images[0].url}
            alt={images[0].alt || 'Main image'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Center two images */}
      {(images[1] || images[2]) && (
        <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
          {images[1] && (
            <div
              style={{
                flex: 1,
                aspectRatio: '1',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <img
                src={images[1].url}
                alt={images[1].alt || 'Gallery image 2'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          {images[2] && (
            <div
              style={{
                flex: 1,
                aspectRatio: '1',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <img
                src={images[2].url}
                alt={images[2].alt || 'Gallery image 3'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Bottom three images */}
      {(images[3] || images[4] || images[5]) && (
        <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
          {[images[3], images[4], images[5]].filter(Boolean).map((img, idx) => (
            <div
              key={img!.id || `bottom-${idx}`}
              style={{
                flex: 1,
                aspectRatio: '1',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <img
                src={img!.url}
                alt={img!.alt || `Gallery image ${idx + 4}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpacerRenderer({ block }: { block: BlockBase & { height: string } }) {
  const heights: Record<string, string> = {
    small: '24px',
    medium: '48px',
    large: '80px',
  };

  return <div style={{ height: heights[block.height] || '48px' }} />;
}

function DividerRenderer({ block }: { block: BlockBase & { style?: string } }) {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `1px ${block.style || 'solid'} #e5e7eb`,
        margin: '0',
      }}
    />
  );
}

// ---- Main renderer ----

interface NewsBlockRendererProps {
  blocks: Array<Record<string, unknown>>;
}

/**
 * Renders block-based content for the public news detail page.
 * Each block is rendered according to its `type` field.
 */
export default function NewsBlockRenderer({ blocks }: NewsBlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        width: '100%',
      }}
    >
      {blocks.map((block) => {
        const key = (block.id as string) || `block-${block.order}`;
        const blockWithBase = block as unknown as BlockBase;

        switch (block.type) {
          case 'hero-image':
            return (
              <HeroImageRenderer
                key={key}
                block={blockWithBase as BlockBase & { url: string; alt: string }}
              />
            );
          case 'text':
            return (
              <TextRenderer
                key={key}
                block={blockWithBase as BlockBase & { content: string; fontSize?: number; fontWeight?: string; color?: string; lineHeight?: number }}
              />
            );
          case 'heading':
            return (
              <HeadingRenderer
                key={key}
                block={blockWithBase as BlockBase & { level: number; content: string }}
              />
            );
          case 'image':
            return (
              <ImageRenderer
                key={key}
                block={blockWithBase as BlockBase & { url: string; alt: string; caption?: string; size: string }}
              />
            );
          case 'image-grid':
            return (
              <ImageGridRenderer
                key={key}
                block={blockWithBase as BlockBase & { images: ImageData[]; rows: ImageGridRow[]; gap?: number; aspectRatio?: number }}
              />
            );
          case 'gallery':
            return (
              <GalleryRenderer
                key={key}
                block={blockWithBase as BlockBase & { images: { id: string; url: string; alt?: string }[]; layout?: string }}
              />
            );
          case 'spacer':
            return (
              <SpacerRenderer
                key={key}
                block={blockWithBase as BlockBase & { height: string }}
              />
            );
          case 'divider':
            return (
              <DividerRenderer
                key={key}
                block={blockWithBase as BlockBase & { style?: string }}
              />
            );
          default:
            // Skip unknown block types silently
            return null;
        }
      })}
    </div>
  );
}
