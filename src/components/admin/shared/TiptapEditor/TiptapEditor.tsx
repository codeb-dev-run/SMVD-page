'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useCallback, useRef, useState } from 'react';
import { TiptapEditorProps, ImageUploadResult } from './types';
import { TiptapContent, isTiptapContent } from '../BlockEditor/types';
import { markdownToTiptapJSON, tiptapJSONToText } from '@/lib/tiptap/markdown-converter';
import TiptapToolbar from './TiptapToolbar';
import CustomImage from './CustomImage';
import { Columns, Column } from './ColumnsExtension';
import './styles.css';

const lowlight = createLowlight(common);

export default function TiptapEditor({
  content,
  contentFormat,
  onChange,
  onImageUpload,
  placeholder = 'Start typing...',
  fontSize = 16,
  fontWeight = '400',
  color = '#1b1d1f',
  lineHeight = 1.8,
  className = '',
  editorId,
}: TiptapEditorProps) {
  const uploadInProgressRef = useRef(false);
  const previousContentStringRef = useRef<string>('');
  const isInitializingRef = useRef(false);
  const isInternalChangeRef = useRef(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Shared image upload helper
  const uploadAndInsertImage = useCallback(async (file: File, editorInstance: ReturnType<typeof useEditor>) => {
    if (!editorInstance || !file.type.startsWith('image/')) return;

    uploadInProgressRef.current = true;

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
        editorInstance
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
      uploadInProgressRef.current = false;
      if (editorInstance) {
        const json = editorInstance.getJSON() as TiptapContent;
        onChange(json);
      }
    }
  }, [onChange]);

  // Initialize editor with proper extensions
  const editor = useEditor({
    immediatelyRender: false, // ✅ Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        bulletList: {
          keepMarks: true,
        },
        orderedList: {
          keepMarks: true,
        },
      }),
      Underline,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'tiptap-image-node',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Columns,
      Column,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Only emit changes if upload is not in progress AND not initializing
      if (!uploadInProgressRef.current && !isInitializingRef.current) {
        isInternalChangeRef.current = true; // Mark as internal (user typing)
        const json = editor.getJSON() as TiptapContent;
        onChange(json);
      }
    },
  });

  // Handle initial content loading and external content changes
  useEffect(() => {
    if (!editor) return;

    // Skip setContent for internal changes (user typing in the editor)
    // This prevents scroll position reset on every keystroke
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      // Update ref so future external changes are detected correctly
      if (isTiptapContent(content)) {
        previousContentStringRef.current = JSON.stringify(content);
      }
      return;
    }

    let tiptapContent: TiptapContent;

    // Convert input content to Tiptap JSON
    if (typeof content === 'string') {
      // Legacy markdown format
      tiptapContent = markdownToTiptapJSON(content);
    } else if (isTiptapContent(content)) {
      // Already Tiptap JSON
      tiptapContent = content;
    } else {
      // Default to empty doc
      tiptapContent = { type: 'doc', content: [] };
    }

    // Compare JSON stringified content to detect external changes only
    const currentContentString = JSON.stringify(tiptapContent);
    if (previousContentStringRef.current !== currentContentString) {
      // Content has changed externally (from parent prop)
      previousContentStringRef.current = currentContentString;

      // Mark as initializing to prevent onChange firing during setContent
      isInitializingRef.current = true;
      editor.commands.setContent(tiptapContent);

      // Reset flag after a tick
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 0);
    }
  }, [content, editor]); // ✅ Detects external content changes from parent modals

  // Expose uploadInProgress to toolbar
  const handleImageUploadStart = useCallback(() => {
    uploadInProgressRef.current = true;
  }, []);

  const handleImageUploadEnd = useCallback(() => {
    uploadInProgressRef.current = false;
    // Re-emit current content since onUpdate was suppressed during upload
    if (editor) {
      const json = editor.getJSON() as TiptapContent;
      onChange(json);
    }
  }, [editor, onChange]);

  // Drag & drop handlers for images
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length > 0 && editor) {
      imageFiles.forEach(file => uploadAndInsertImage(file, editor));
    }
  }, [editor, uploadAndInsertImage]);

  // Paste handler for images
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));

    if (imageItems.length > 0 && editor) {
      e.preventDefault();
      imageItems.forEach(item => {
        const file = item.getAsFile();
        if (file) uploadAndInsertImage(file, editor);
      });
    }
  }, [editor, uploadAndInsertImage]);

  if (!editor) {
    return <div className="tiptap-editor-loading">Loading editor...</div>;
  }

  return (
    <div
      className={`tiptap-editor-wrapper ${className}`}
      id={editorId}
      style={{
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        color: color,
        lineHeight: lineHeight,
      }}
    >
      <TiptapToolbar
        editor={editor}
        onUploadStart={handleImageUploadStart}
        onUploadEnd={handleImageUploadEnd}
      />
      <div
        className={`tiptap-editor-content ${isDraggingOver ? 'tiptap-drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
      >
        {isDraggingOver && (
          <div className="tiptap-drop-overlay">
            <div className="tiptap-drop-overlay-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>이미지를 여기에 드롭하세요</p>
            </div>
          </div>
        )}
        <EditorContent editor={editor} className="ProseMirror" />
      </div>
    </div>
  );
}
