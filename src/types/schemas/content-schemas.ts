import { z } from 'zod';

// Tiptap mark 스키마
const tiptapMarkSchema = z.object({
  type: z.string(),
  attrs: z.record(z.string(), z.unknown()).optional(),
});

// Tiptap node 타입 (재귀)
type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

// Tiptap node 스키마 (z.lazy로 재귀)
const tiptapNodeSchema: z.ZodType<TiptapNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(tiptapNodeSchema).optional(),
    marks: z.array(tiptapMarkSchema).optional(),
    text: z.string().optional(),
  })
);

// Tiptap 문서 스키마
export const tiptapContentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(tiptapNodeSchema).optional(),
});

// 범용 JSON 타입 (비정형 JSON용)
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// 범용 JSON 스키마 (z.lazy 재귀 타입 명시)
export const jsonSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(z.string(), jsonSchema),
  ])
);

// Block 콘텐츠용 스키마 (블록 에디터)
export const blockContentSchema = z
  .object({
    blocks: z.array(z.record(z.string(), z.unknown())),
    rowConfig: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .passthrough();
