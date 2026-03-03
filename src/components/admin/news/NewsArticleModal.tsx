'use client';

import { useState, useEffect, useCallback } from 'react';
import GalleryEditor from './GalleryEditor';
import type {
  NewsArticleData,
  CreateArticleInput,
  UpdateArticleInput,
  NewsContentData,
  GalleryData,
} from '@/hooks/useNewsEditor';

interface NewsArticleModalProps {
  isOpen: boolean;
  article?: NewsArticleData | null;
  onClose: () => void;
  onSubmit: (data: CreateArticleInput | UpdateArticleInput) => void;
}

const CATEGORIES = ['Notice', 'Event', 'Lecture', 'Exhibition', 'Awards', 'Recruiting'];

const emptyGallery: GalleryData = {
  main: '',
  layout: '1+2+3',
  centerLeft: '',
  centerRight: '',
  bottomLeft: '',
  bottomCenter: '',
  bottomRight: '',
};

export default function NewsArticleModal({
  isOpen,
  article,
  onClose,
  onSubmit,
}: NewsArticleModalProps) {
  const isEditing = !!article;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Notice');
  const [excerpt, setExcerpt] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState('/Group-27.svg');
  const [publishedAt, setPublishedAt] = useState('');
  const [published, setPublished] = useState(true);

  // Content fields
  const [introTitle, setIntroTitle] = useState('');
  const [introText, setIntroText] = useState('');
  const [hasGallery, setHasGallery] = useState(false);
  const [gallery, setGallery] = useState<GalleryData>(emptyGallery);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<'notice' | 'event' | 'custom'>('custom');

  const handleTemplateChange = (tpl: 'notice' | 'event' | 'custom') => {
    setTemplate(tpl);
    if (tpl === 'notice') {
      setIntroTitle(title);
      setIntroText('');
      setHasGallery(false);
      setGallery(emptyGallery);
    } else if (tpl === 'event') {
      setIntroTitle(title);
      setHasGallery(true);
      setGallery(emptyGallery);
    } else {
      setIntroTitle('');
      setIntroText('');
      setHasGallery(false);
      setGallery(emptyGallery);
    }
  };

  // Reset form when modal opens or article changes
  useEffect(() => {
    if (isOpen) {
      if (article) {
        setTitle(article.title);
        setCategory(article.category);
        setExcerpt(article.excerpt || '');
        setThumbnailImage(article.thumbnailImage);
        setPublishedAt(
          article.publishedAt
            ? new Date(article.publishedAt).toISOString().split('T')[0]
            : ''
        );
        setPublished(article.published);

        // Content fields
        const content = article.content as NewsContentData | null;
        setIntroTitle(content?.introTitle || '');
        setIntroText(content?.introText || '');
        if (content?.gallery) {
          setHasGallery(true);
          setGallery({ ...emptyGallery, ...content.gallery });
        } else {
          setHasGallery(false);
          setGallery(emptyGallery);
        }
      } else {
        setTitle('');
        setCategory('Notice');
        setExcerpt('');
        setThumbnailImage('/Group-27.svg');
        setPublishedAt(new Date().toISOString().split('T')[0]);
        setPublished(true);
        setIntroTitle('');
        setIntroText('');
        setHasGallery(false);
        setGallery(emptyGallery);
      }
      setError(null);
    }
  }, [isOpen, article]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('제목을 입력하세요');
      return;
    }
    if (!category) {
      setError('카테고리를 선택하세요');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build content object
      let content: NewsContentData | null = null;
      if (introTitle || introText || hasGallery) {
        content = {};
        if (introTitle) content.introTitle = introTitle;
        if (introText) content.introText = introText;
        if (hasGallery) content.gallery = gallery;
      }

      const data: CreateArticleInput = {
        title: title.trim(),
        category,
        excerpt: excerpt.trim() || undefined,
        thumbnailImage,
        content,
        publishedAt: publishedAt || new Date().toISOString().split('T')[0],
        published,
      };

      onSubmit(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? '뉴스 수정' : '새 뉴스 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="닫기"
          >
            x
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row: Title + Category */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label htmlFor="article-title" className="block text-sm font-medium text-gray-700 mb-1">
                제목 *
              </label>
              <input
                id="article-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="뉴스 제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="article-category" className="block text-sm font-medium text-gray-700 mb-1">
                카테고리 *
              </label>
              <select
                id="article-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 발행일 */}
          <div>
            <label htmlFor="article-date" className="block text-sm font-medium text-gray-700 mb-1">
              발행일 *
            </label>
            <input
              id="article-date"
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* 추가 정보 (선택사항) */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 rounded-lg">
              추가 정보 (선택사항)
            </summary>
            <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-200">
              {/* Excerpt */}
              <div>
                <label htmlFor="article-excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                  요약 (목록에 표시)
                </label>
                <textarea
                  id="article-excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="목록에 표시될 2줄 요약..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y"
                />
              </div>

              {/* Thumbnail */}
              <div>
                <label htmlFor="article-thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
                  썸네일 이미지 경로
                </label>
                <input
                  id="article-thumbnail"
                  type="text"
                  value={thumbnailImage}
                  onChange={(e) => setThumbnailImage(e.target.value)}
                  placeholder="/Group-27.svg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                {thumbnailImage && (
                  <div className="mt-2 w-20 h-20 bg-gray-100 rounded overflow-hidden">
                    <img src={thumbnailImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Published */}
              <div className="flex items-center gap-2">
                <input
                  id="article-published"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="article-published" className="text-sm font-medium text-gray-700">
                  공개
                </label>
              </div>
            </div>
          </details>

          {/* Divider - Content Section */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              상세 페이지 콘텐츠 (선택)
            </h3>

            {/* Template Buttons */}
            <div className="flex gap-2 mb-4">
              {(
                [
                  { key: 'notice', label: '공지 기본' },
                  { key: 'event', label: '이벤트 기본' },
                  { key: 'custom', label: '직접 작성' },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTemplateChange(key)}
                  className={`px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors ${
                    template === key
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Intro Title */}
          <div>
            <label htmlFor="article-intro-title" className="block text-sm font-medium text-gray-700 mb-1">
              상세 제목
            </label>
            <input
              id="article-intro-title"
              type="text"
              value={introTitle}
              onChange={(e) => setIntroTitle(e.target.value)}
              placeholder="상세 페이지에 표시될 제목"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Intro Text */}
          <div>
            <label htmlFor="article-intro-text" className="block text-sm font-medium text-gray-700 mb-1">
              상세 설명
            </label>
            <textarea
              id="article-intro-text"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="상세 페이지의 본문 텍스트..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y"
            />
          </div>

          {/* Gallery Toggle */}
          <div className="flex items-center gap-2">
            <input
              id="article-has-gallery"
              type="checkbox"
              checked={hasGallery}
              onChange={(e) => setHasGallery(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="article-has-gallery" className="text-sm font-medium text-gray-700">
              복합 갤러리 사용 (1+2+3 레이아웃)
            </label>
          </div>

          {/* Gallery Editor */}
          {hasGallery && (
            <GalleryEditor gallery={gallery} onChange={setGallery} />
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {isSubmitting ? '저장 중...' : isEditing ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
