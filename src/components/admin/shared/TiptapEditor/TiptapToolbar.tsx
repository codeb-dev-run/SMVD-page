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
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

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

  const handleAddLink = useCallback(() => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkUrl('');
    setLinkInputVisible(false);
  }, [editor, linkUrl]);

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
        alert('Failed to upload image');
      } finally {
        onUploadEnd?.();
      }
    };

    input.click();
  }, [editor, onUploadStart, onUploadEnd]);

  return (
    <div className="tiptap-toolbar">
      {/* Text Formatting */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <Underline size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
      </div>

      {/* Headings */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
      </div>

      {/* Lists */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`}
          title="Quote"
        >
          <Quote size={18} />
        </button>
      </div>

      {/* Code */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`toolbar-button ${editor.isActive('code') ? 'active' : ''}`}
          title="Inline Code"
        >
          <Code size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
          title="Code Block"
        >
          <Code2 size={18} />
        </button>
      </div>

      {/* Media & Links */}
      <div className="toolbar-group">
        <div className="toolbar-link-input">
          <button
            onClick={() => setLinkInputVisible(!linkInputVisible)}
            className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
            title="Link"
          >
            <Link2 size={18} />
          </button>
          {linkInputVisible && (
            <div className="link-input-wrapper">
              <input
                type="text"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddLink();
                  if (e.key === 'Escape') {
                    setLinkInputVisible(false);
                    setLinkUrl('');
                  }
                }}
                autoFocus
                className="link-input"
              />
              <button onClick={handleAddLink} className="link-submit">
                Add
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleImageUpload}
          className="toolbar-button"
          title="Insert Image"
        >
          <Image size={18} />
        </button>
      </div>

      {/* Text Alignment */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
      </div>

      {/* Column Layouts + Vertical Alignment */}
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

      {/* Undo/Redo */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="toolbar-button"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="toolbar-button"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={18} />
        </button>
      </div>
    </div>
  );
}
