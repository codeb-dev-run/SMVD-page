/**
 * Server-safe XSS sanitizer (no jsdom dependency)
 * - Strips <script>, <iframe>, <object>, <embed> tags
 * - Strips event handlers (onclick, onerror, etc.)
 * - Strips javascript:, data:, vbscript: URIs
 * - Works in both server and client environments
 */

const DANGEROUS_TAGS_RE = /<\s*(script|iframe|object|embed|applet|form)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi;
const SELF_CLOSING_DANGEROUS_RE = /<\s*(script|iframe|object|embed|applet)[^>]*\/?\s*>/gi;
const EVENT_HANDLER_RE = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
const DANGEROUS_URI_RE = /(?:href|src|action|formaction|xlink:href)\s*=\s*(?:"(?:javascript|data|vbscript):[^"]*"|'(?:javascript|data|vbscript):[^']*')/gi;
const STYLE_EXPRESSION_RE = /style\s*=\s*(?:"[^"]*expression\s*\([^"]*"|'[^']*expression\s*\([^']*')/gi;

export const sanitizeContent = (content: string | null | undefined): string => {
  if (!content) return '';
  return content
    .replace(DANGEROUS_TAGS_RE, '')
    .replace(SELF_CLOSING_DANGEROUS_RE, '')
    .replace(EVENT_HANDLER_RE, '')
    .replace(DANGEROUS_URI_RE, '')
    .replace(STYLE_EXPRESSION_RE, '');
};
