'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Pencil, Eye, EyeOff, ExternalLink } from 'lucide-react';
import type { NewsArticleData } from '@/hooks/useNewsEditor';

interface NewsArticleListProps {
  items: NewsArticleData[];
  onEdit: (article: NewsArticleData) => void;
  onDelete: (id: string) => void;
  onReorder: (articleId: string, newOrder: number) => void;
  onTogglePublish: (article: NewsArticleData) => void;
}

function SortableArticleItem({
  item,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  item: NewsArticleData;
  onEdit: (article: NewsArticleData) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (article: NewsArticleData) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryColors: Record<string, string> = {
    Notice: 'bg-blue-100 text-blue-800',
    Event: 'bg-purple-100 text-purple-800',
    Awards: 'bg-yellow-100 text-yellow-800',
    Recruiting: 'bg-green-100 text-green-800',
  };

  const dateStr = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString('ko-KR')
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors bg-white ${
        item.published ? 'border-gray-200' : 'border-orange-300 bg-orange-50'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-2 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded transition-colors shrink-0"
        title="드래그해서 순서 변경"
      >
        <GripVertical size={20} className="text-gray-400" />
      </button>

      <div className="w-16 h-16 bg-gray-200 rounded shrink-0 flex items-center justify-center overflow-hidden">
        <img
          src={item.thumbnailImage}
          alt={item.title}
          className="w-full h-full object-cover rounded"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{item.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${
              categoryColors[item.category] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {item.category}
          </span>
          <span className="text-xs text-gray-400">{dateStr}</span>
          {!item.published && (
            <span className="text-xs text-orange-500 font-medium">비공개</span>
          )}
        </div>
        {item.excerpt && (
          <p className="text-xs text-gray-500 mt-1 truncate">{item.excerpt}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => window.open(`/news/${item.slug}`, '_blank')}
          className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded transition-colors"
          title="미리보기"
        >
          <ExternalLink size={18} />
        </button>
        <button
          onClick={() => onTogglePublish(item)}
          className={`p-2 rounded transition-colors ${
            item.published
              ? 'text-green-500 hover:bg-green-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          title={item.published ? '비공개로 전환' : '공개로 전환'}
        >
          {item.published ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
          title="수정"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => {
            if (!confirm(`"${item.title}" 뉴스를 삭제하시겠습니까?`)) return;
            try {
              onDelete(item.id);
            } catch (err) {
              alert(err instanceof Error ? err.message : '삭제 실패');
            }
          }}
          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
          title="삭제"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default function NewsArticleList({
  items: initialItems,
  onEdit,
  onDelete,
  onReorder,
  onTogglePublish,
}: NewsArticleListProps) {
  const [items, setItems] = useState<NewsArticleData[]>(initialItems || []);
  const itemsBeforeDragRef = useRef<NewsArticleData[]>([]);

  useEffect(() => {
    setItems(initialItems || []);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        itemsBeforeDragRef.current = items;
        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);

        try {
          onReorder(active.id as string, newIndex);
        } catch (err) {
          setItems(itemsBeforeDragRef.current);
          alert(err instanceof Error ? err.message : '순서 변경 실패');
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((item) => (
              <SortableArticleItem
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePublish={onTogglePublish}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              뉴스가 없습니다. 초기화 또는 추가해주세요.
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
