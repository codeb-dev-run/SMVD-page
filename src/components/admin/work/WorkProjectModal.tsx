'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WorkProjectData, CreateProjectInput, UpdateProjectInput } from '@/hooks/useWorkEditor';

interface WorkProjectModalProps {
  isOpen: boolean;
  project?: WorkProjectData | null;
  onClose: () => void;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => void;
}

const CATEGORIES = ['UX/UI', 'Motion', 'Branding', 'Game', 'Graphics'];

export default function WorkProjectModal({
  isOpen,
  project,
  onClose,
  onSubmit,
}: WorkProjectModalProps) {
  const isEditing = !!project;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('2025');
  const [heroImage, setHeroImage] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState('');
  const [galleryImagesStr, setGalleryImagesStr] = useState('');
  const [published, setPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        setTitle(project.title);
        setSubtitle(project.subtitle);
        setCategory(project.category);
        setTags(project.tags.join(', '));
        setAuthor(project.author);
        setEmail(project.email);
        setDescription(project.description);
        setYear(project.year);
        setHeroImage(project.heroImage);
        setThumbnailImage(project.thumbnailImage);
        setGalleryImagesStr(
          Array.isArray(project.galleryImages)
            ? project.galleryImages.join('\n')
            : ''
        );
        setPublished(project.published);
      } else {
        setTitle('');
        setSubtitle('');
        setCategory('');
        setTags('');
        setAuthor('');
        setEmail('');
        setDescription('');
        setYear('2025');
        setHeroImage('');
        setThumbnailImage('');
        setGalleryImagesStr('');
        setPublished(true);
      }
      setError(null);
    }
  }, [isOpen, project]);

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

    if (!title.trim()) { setError('제목을 입력하세요'); return; }
    if (!category) { setError('카테고리를 선택하세요'); return; }

    if (!isEditing) {
      if (!thumbnailImage.trim()) { setError('썸네일 이미지 경로를 입력하세요'); return; }
    }

    setIsSubmitting(true);

    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const parsedGallery = galleryImagesStr
        .split('\n')
        .map((g) => g.trim())
        .filter(Boolean);

      const data: CreateProjectInput = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        category,
        tags: parsedTags,
        author: author.trim(),
        email: email.trim(),
        description: description.trim(),
        year,
        heroImage: heroImage.trim(),
        thumbnailImage: thumbnailImage.trim(),
        galleryImages: parsedGallery,
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
            {isEditing ? '프로젝트 수정' : '새 프로젝트 추가'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 mb-1">
                제목 *
              </label>
              <input
                id="project-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vora"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="project-category" className="block text-sm font-medium text-gray-700 mb-1">
                카테고리 *
              </label>
              <select
                id="project-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">선택하세요</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label htmlFor="project-thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
              썸네일 이미지 경로 {!isEditing && '*'}
            </label>
            <input
              id="project-thumbnail"
              type="text"
              value={thumbnailImage}
              onChange={(e) => setThumbnailImage(e.target.value)}
              placeholder="/images/work/portfolio-12.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            {thumbnailImage && (
              <div className="mt-2 w-24 h-18 bg-gray-100 rounded overflow-hidden">
                <img src={thumbnailImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Optional fields */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50 rounded-lg">
              추가 정보 (선택사항)
            </summary>
            <div className="px-4 pb-4 pt-3 space-y-5">
              {/* Subtitle */}
              <div>
                <label htmlFor="project-subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                  부제
                </label>
                <input
                  id="project-subtitle"
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="권나연 외 3명, 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Row: Author + Email + Year */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="project-author" className="block text-sm font-medium text-gray-700 mb-1">
                    작가명
                  </label>
                  <input
                    id="project-author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="권나연"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label htmlFor="project-email" className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    id="project-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label htmlFor="project-year" className="block text-sm font-medium text-gray-700 mb-1">
                    연도
                  </label>
                  <input
                    id="project-year"
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="project-tags" className="block text-sm font-medium text-gray-700 mb-1">
                  태그 (쉼표 구분)
                </label>
                <input
                  id="project-tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="UX/UI, Branding, Motion"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="프로젝트 설명..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y"
                />
              </div>

              {/* Hero Image */}
              <div>
                <label htmlFor="project-hero" className="block text-sm font-medium text-gray-700 mb-1">
                  히어로 이미지 경로
                </label>
                <input
                  id="project-hero"
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="/images/work/vora/hero.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                {heroImage && (
                  <div className="mt-2 w-full h-24 bg-gray-100 rounded overflow-hidden">
                    <img src={heroImage} alt="Hero preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label htmlFor="project-gallery" className="block text-sm font-medium text-gray-700 mb-1">
                  갤러리 이미지 (줄바꿈으로 구분)
                </label>
                <textarea
                  id="project-gallery"
                  value={galleryImagesStr}
                  onChange={(e) => setGalleryImagesStr(e.target.value)}
                  placeholder={"/images/work/vora/gallery-1.png\n/images/work/vora/gallery-2.png\n/images/work/vora/gallery-3.png"}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  한 줄에 하나의 이미지 경로를 입력하세요
                </p>
              </div>

              {/* Published */}
              <div className="flex items-center gap-2">
                <input
                  id="project-published"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="project-published" className="text-sm font-medium text-gray-700">
                  공개
                </label>
              </div>
            </div>
          </details>

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
