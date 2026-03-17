'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Link2,
  Unlink,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Undo2,
  Redo2,
  Columns2,
  Columns3,
} from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import './toolbar.css';
import './ColumnsExtension';

interface TiptapToolbarProps {
  editor: Editor;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

export default function TiptapToolbar({
  editor,
  onUploadStart,
  onUploadEnd,
}: TiptapToolbarProps) {
  // Force re-render on selection change so isActive('column') updates
  const [, setSelectionTick] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setSelectionTick((n) => n + 1);
    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);
    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor]);

  const handleToggleLink = useCallback(() => {
    if (editor.isActive('link')) {
      // 이미 링크가 있으면 제거
      editor.chain().focus().unsetLink().run();
    } else {
      // 텍스트가 선택된 경우에만 링크 추가
      const { from, to } = editor.state.selection;
      if (from === to) {
        alert('링크를 걸 텍스트를 먼저 선택해주세요');
        return;
      }
      const url = window.prompt('링크 URL을 입력하세요');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  }, [editor]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      onUploadStart?.();

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const result = await response.json();
        if (result.success && result.data) {
          editor
            .chain()
            .focus()
            .setImage({
              src: result.data.path,
              alt: result.data.altText || file.name,
              width: result.data.width,
              height: result.data.height,
            })
            .createParagraphNear()
            .scrollIntoView()
            .run();
        }
      } catch (error) {
        console.error('Image upload error:', error);
        alert('이미지 업로드에 실패했습니다');
      } finally {
        onUploadEnd?.();
      }
    };

    input.click();
  }, [editor, onUploadStart, onUploadEnd]);

  return (
    <div className="tiptap-toolbar">
      {/* 텍스트 서식 */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
          title="굵게 (Ctrl+B)"
        >
          <Bold size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
          title="기울임 (Ctrl+I)"
        >
          <Italic size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
          title="밑줄 (Ctrl+U)"
        >
          <Underline size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`}
          title="취소선"
        >
          <Strikethrough size={18} />
        </button>
      </div>

      {/* 제목 */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          title="제목 1 (가장 큰 제목)"
        >
          <Heading1 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          title="제목 2 (중간 제목)"
        >
          <Heading2 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          title="제목 3 (작은 제목)"
        >
          <Heading3 size={18} />
        </button>
      </div>

      {/* 목록 */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="글머리 기호 목록"
        >
          <List size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="번호 매기기 목록"
        >
          <ListOrdered size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`}
          title="인용문"
        >
          <Quote size={18} />
        </button>
      </div>

      {/* 코드 */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`toolbar-button ${editor.isActive('code') ? 'active' : ''}`}
          title="인라인 코드"
        >
          <Code size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
          title="코드 블록"
        >
          <Code2 size={18} />
        </button>
      </div>

      {/* 링크 & 이미지 */}
      <div className="toolbar-group">
        <button
          onClick={handleToggleLink}
          className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
          title={editor.isActive('link') ? '링크 제거' : '링크 삽입 (텍스트 선택 후 클릭)'}
        >
          {editor.isActive('link') ? <Unlink size={18} /> : <Link2 size={18} />}
        </button>

        <button
          onClick={handleImageUpload}
          className="toolbar-button"
          title="이미지 삽입 (클릭 또는 에디터에 드래그앤드롭)"
        >
          <Image size={18} />
        </button>
      </div>

      {/* 텍스트 정렬 */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
          title="왼쪽 정렬"
        >
          <AlignLeft size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
          title="가운데 정렬"
        >
          <AlignCenter size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
          title="오른쪽 정렬"
        >
          <AlignRight size={18} />
        </button>
      </div>

      {/* 다단 레이아웃 + 세로 정렬 */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().insertColumns(2).run()}
          className="toolbar-button"
          title="2열 레이아웃"
        >
          <Columns2 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().insertColumns(3).run()}
          className="toolbar-button"
          title="3열 레이아웃"
        >
          <Columns3 size={18} />
        </button>

        <span className="toolbar-separator" />

        <button
          onClick={() => editor.chain().focus().setColumnVerticalAlign('top').run()}
          disabled={!editor.isActive('column')}
          className={`toolbar-button ${editor.isActive('column') && (editor.getAttributes('column').verticalAlign || 'top') === 'top' ? 'active' : ''}`}
          title={editor.isActive('column') ? '세로 상단 정렬' : '컬럼 내부를 클릭하세요'}
        >
          <AlignVerticalJustifyStart size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setColumnVerticalAlign('center').run()}
          disabled={!editor.isActive('column')}
          className={`toolbar-button ${editor.isActive('column') && editor.getAttributes('column').verticalAlign === 'center' ? 'active' : ''}`}
          title={editor.isActive('column') ? '세로 가운데 정렬' : '컬럼 내부를 클릭하세요'}
        >
          <AlignVerticalJustifyCenter size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setColumnVerticalAlign('bottom').run()}
          disabled={!editor.isActive('column')}
          className={`toolbar-button ${editor.isActive('column') && editor.getAttributes('column').verticalAlign === 'bottom' ? 'active' : ''}`}
          title={editor.isActive('column') ? '세로 하단 정렬' : '컬럼 내부를 클릭하세요'}
        >
          <AlignVerticalJustifyEnd size={18} />
        </button>
      </div>

      {/* 실행 취소/다시 실행 */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="toolbar-button"
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="toolbar-button"
          title="다시 실행 (Ctrl+Y)"
        >
          <Redo2 size={18} />
        </button>
      </div>
    </div>
  );
}
