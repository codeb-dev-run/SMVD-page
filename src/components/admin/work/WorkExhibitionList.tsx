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
import { GripVertical, Trash2, Pencil } from 'lucide-react';
import type { WorkExhibitionData } from '@/hooks/useWorkEditor';

interface WorkExhibitionListProps {
  items: WorkExhibitionData[];
  onEdit: (exhibition: WorkExhibitionData) => void;
  onDelete: (id: string) => void;
  onReorder: (exhibitionId: string, newOrder: number) => void;
}

function SortableExhibitionItem({
  item,
  onEdit,
  onDelete,
}: {
  item: WorkExhibitionData;
  onEdit: (exhibition: WorkExhibitionData) => void;
  onDelete: (id: string) => void;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors bg-white"
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
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <span className="text-gray-400 text-xs">No Image</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{item.title}</p>
        <p className="text-sm text-gray-600">{item.subtitle}</p>
        <p className="text-xs text-gray-400 mt-1">
          {item.artist} | {item.year}
          {!item.published && (
            <span className="ml-2 text-orange-500 font-medium">비공개</span>
          )}
          {item.showOnHome && (
            <span className="ml-2 text-green-600 font-medium">홈 표시</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
          title="수정"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => {
            if (!confirm(`"${item.title}" 전시를 삭제하시겠습니까?`)) return;
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

export default function WorkExhibitionList({
  items: initialItems,
  onEdit,
  onDelete,
  onReorder,
}: WorkExhibitionListProps) {
  const [items, setItems] = useState<WorkExhibitionData[]>(initialItems || []);
  const itemsBeforeDragRef = useRef<WorkExhibitionData[]>([]);

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
              <SortableExhibitionItem
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              전시 아이템이 없습니다. 초기화 또는 추가해주세요.
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
