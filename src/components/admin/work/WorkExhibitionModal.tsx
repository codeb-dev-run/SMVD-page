'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { WorkExhibitionData, CreateExhibitionInput } from '@/hooks/useWorkEditor';
import { useModalDirtyState } from '@/hooks/useModalDirtyState';
import { UnsavedChangesDialog } from '@/components/admin/shared/UnsavedChangesDialog';

interface WorkExhibitionModalProps {
  isOpen: boolean;
  exhibition?: WorkExhibitionData | null;
  onClose: () => void;
  onSubmit: (data: CreateExhibitionInput) => void;
}

export default function WorkExhibitionModal({
  isOpen,
  exhibition,
  onClose,
  onSubmit,
}: WorkExhibitionModalProps) {
  const isEditing = !!exhibition;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [artist, setArtist] = useState('');
  const [image, setImage] = useState('');
  const [year, setYear] = useState('2025');
  const [published, setPublished] = useState(true);
  const [showOnHome, setShowOnHome] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Dirty State ----
  const formState = useMemo(() => ({
    title, subtitle, artist, image, year, published, showOnHome,
  }), [title, subtitle, artist, image, year, published, showOnHome]);

  const {
    isDirty,
    revert,
    showCloseConfirm,
    setShowCloseConfirm,
    handleClose,
  } = useModalDirtyState(formState, isOpen);

  const handleCloseAttempt = useCallback(() => {
    handleClose(onClose);
  }, [handleClose, onClose]);

  const handleRevert = useCallback(() => {
    const snapshot = revert();
    setTitle(snapshot.title);
    setSubtitle(snapshot.subtitle);
    setArtist(snapshot.artist);
    setImage(snapshot.image);
    setYear(snapshot.year);
    setPublished(snapshot.published);
    setShowOnHome(snapshot.showOnHome);
  }, [revert]);

  useEffect(() => {
    if (isOpen) {
      if (exhibition) {
        setTitle(exhibition.title);
        setSubtitle(exhibition.subtitle);
        setArtist(exhibition.artist);
        setImage(exhibition.image);
        setYear(exhibition.year);
        setPublished(exhibition.published);
        setShowOnHome(exhibition.showOnHome);
      } else {
        setTitle('');
        setSubtitle('');
        setArtist('');
        setImage('');
        setYear('2025');
        setPublished(true);
        setShowOnHome(false);
      }
      setError(null);
    }
  }, [isOpen, exhibition]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseAttempt();
    },
    [handleCloseAttempt]
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
    if (!subtitle.trim()) { setError('부제를 입력하세요'); return; }
    if (!artist.trim()) { setError('작가명을 입력하세요'); return; }
    if (!image.trim()) { setError('이미지 경로를 입력하세요'); return; }

    setIsSubmitting(true);

    try {
      onSubmit({
        title: title.trim(),
        subtitle: subtitle.trim(),
        artist: artist.trim(),
        image: image.trim(),
        year,
        published,
        showOnHome,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? '전시 수정' : '새 전시 추가'}
            </h2>
            <button
              onClick={handleCloseAttempt}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              aria-label="닫기"
            >
              x
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label htmlFor="exhibition-title" className="block text-sm font-medium text-gray-700 mb-1">
                제목 *
              </label>
              <input
                id="exhibition-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vora"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="exhibition-subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                부제 *
              </label>
              <input
                id="exhibition-subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="권나연 외 3명, 2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="exhibition-artist" className="block text-sm font-medium text-gray-700 mb-1">
                  작가 *
                </label>
                <input
                  id="exhibition-artist"
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="권나연"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="exhibition-year" className="block text-sm font-medium text-gray-700 mb-1">
                  연도
                </label>
                <input
                  id="exhibition-year"
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="exhibition-image" className="block text-sm font-medium text-gray-700 mb-1">
                이미지 경로 *
              </label>
              <input
                id="exhibition-image"
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/exhibition/Rectangle 45-5.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              {image && (
                <div className="mt-2 w-full h-32 bg-gray-100 rounded overflow-hidden">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  id="exhibition-published"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="exhibition-published" className="text-sm font-medium text-gray-700">
                  공개
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="exhibition-show-on-home"
                  type="checkbox"
                  checked={showOnHome}
                  onChange={(e) => setShowOnHome(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="exhibition-show-on-home" className="text-sm font-medium text-gray-700">
                  홈에 표시
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleRevert}
                  className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                >
                  되돌리기
                </button>
              )}
              <button
                type="button"
                onClick={handleCloseAttempt}
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

      <UnsavedChangesDialog
        isOpen={showCloseConfirm}
        onKeepEditing={() => setShowCloseConfirm(false)}
        onDiscard={() => {
          setShowCloseConfirm(false);
          onClose();
        }}
      />
    </>
  );
}
