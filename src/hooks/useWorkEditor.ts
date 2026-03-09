'use client';

import { useState, useCallback } from 'react';
import { useDirtyState } from './useDirtyState';
import { deepEqual } from '@/lib/diffUtils';
import type { TiptapContent } from '@/components/admin/shared/BlockEditor/types';

// ---- Types ----

export interface WorkProjectData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  author: string;
  email: string;
  description: string;
  year: string;
  heroImage: string;
  thumbnailImage: string;
  galleryImages: string[];
  order: number;
  published: boolean;
  content?: TiptapContent | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExhibitionData {
  id: string;
  title: string;
  subtitle: string;
  artist: string;
  image: string;
  year: string;
  order: number;
  published: boolean;
  showOnHome: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  author: string;
  email: string;
  description: string;
  year: string;
  heroImage: string;
  thumbnailImage: string;
  galleryImages: string[];
  published?: boolean;
  content?: TiptapContent | null;
}

export interface UpdateProjectInput {
  title?: string;
  subtitle?: string;
  category?: string;
  tags?: string[];
  author?: string;
  email?: string;
  description?: string;
  year?: string;
  heroImage?: string;
  thumbnailImage?: string;
  galleryImages?: string[];
  published?: boolean;
  content?: TiptapContent | null;
}

export interface CreateExhibitionInput {
  title: string;
  subtitle: string;
  artist: string;
  image: string;
  year?: string;
  published?: boolean;
  showOnHome?: boolean;
}

export interface UpdateExhibitionInput {
  title?: string;
  subtitle?: string;
  artist?: string;
  image?: string;
  year?: string;
  published?: boolean;
  showOnHome?: boolean;
}

// ---- Hook ----

let tempIdCounter = 0;

export function useWorkEditor(
  initialProjects: WorkProjectData[] = [],
  initialExhibitions: WorkExhibitionData[] = [],
) {
  const {
    localState: projects,
    setLocalState: setProjects,
    snapshot: projectsSnapshot,
    isDirty: projectsDirty,
    changeCount: projectsChangeCount,
    resetSnapshot: resetProjectsSnapshot,
    revert: revertProjects,
  } = useDirtyState<WorkProjectData[]>(initialProjects);

  const {
    localState: exhibitions,
    setLocalState: setExhibitions,
    snapshot: exhibitionsSnapshot,
    isDirty: exhibitionsDirty,
    changeCount: exhibitionsChangeCount,
    resetSnapshot: resetExhibitionsSnapshot,
    revert: revertExhibitions,
  } = useDirtyState<WorkExhibitionData[]>(initialExhibitions);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = projectsDirty || exhibitionsDirty;
  const changeCount = projectsChangeCount + exhibitionsChangeCount;

  const clearError = useCallback(() => setError(null), []);

  const revert = useCallback(() => {
    revertProjects();
    revertExhibitions();
  }, [revertProjects, revertExhibitions]);

  // ---- Fetch ----

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/admin/work/projects', {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '프로젝트 조회 실패');
      resetProjectsSnapshot(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트 조회 실패');
    } finally {
      setIsLoading(false);
    }
  }, [resetProjectsSnapshot]);

  const fetchExhibitions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/admin/work/exhibitions', {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '전시 조회 실패');
      resetExhibitionsSnapshot(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '전시 조회 실패');
    } finally {
      setIsLoading(false);
    }
  }, [resetExhibitionsSnapshot]);

  // ---- Projects: local-only mutations ----

  const addProject = useCallback((input: CreateProjectInput) => {
    const tempId = `temp_${Date.now()}_${++tempIdCounter}`;
    const newProject: WorkProjectData = {
      id: tempId,
      slug: '',
      title: input.title,
      subtitle: input.subtitle,
      category: input.category,
      tags: input.tags,
      author: input.author,
      email: input.email,
      description: input.description,
      year: input.year,
      heroImage: input.heroImage,
      thumbnailImage: input.thumbnailImage,
      galleryImages: input.galleryImages,
      order: 0,
      published: input.published ?? true,
      content: input.content ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => {
      newProject.order = prev.length;
      return [...prev, newProject];
    });
    return newProject;
  }, [setProjects]);

  const updateProject = useCallback((id: string, input: UpdateProjectInput) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...input, updatedAt: new Date().toISOString() } : p))
    );
  }, [setProjects]);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, [setProjects]);

  const reorderProject = useCallback((projectId: string, newOrder: number) => {
    setProjects((prev) => {
      const items = [...prev];
      const idx = items.findIndex((p) => p.id === projectId);
      if (idx === -1) return prev;
      const [moved] = items.splice(idx, 1);
      items.splice(newOrder, 0, moved);
      return items.map((item, i) => ({ ...item, order: i }));
    });
  }, [setProjects]);

  // ---- Exhibitions: local-only mutations ----

  const addExhibition = useCallback((input: CreateExhibitionInput) => {
    const tempId = `temp_${Date.now()}_${++tempIdCounter}`;
    const newExhibition: WorkExhibitionData = {
      id: tempId,
      title: input.title,
      subtitle: input.subtitle,
      artist: input.artist,
      image: input.image,
      year: input.year || new Date().getFullYear().toString(),
      order: 0,
      published: input.published ?? true,
      showOnHome: input.showOnHome ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setExhibitions((prev) => {
      newExhibition.order = prev.length;
      return [...prev, newExhibition];
    });
    return newExhibition;
  }, [setExhibitions]);

  const updateExhibition = useCallback((id: string, input: UpdateExhibitionInput) => {
    setExhibitions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...input, updatedAt: new Date().toISOString() } : e))
    );
  }, [setExhibitions]);

  const deleteExhibition = useCallback((id: string) => {
    setExhibitions((prev) => prev.filter((e) => e.id !== id));
  }, [setExhibitions]);

  const reorderExhibition = useCallback((exhibitionId: string, newOrder: number) => {
    setExhibitions((prev) => {
      const items = [...prev];
      const idx = items.findIndex((e) => e.id === exhibitionId);
      if (idx === -1) return prev;
      const [moved] = items.splice(idx, 1);
      items.splice(newOrder, 0, moved);
      return items.map((item, i) => ({ ...item, order: i }));
    });
  }, [setExhibitions]);

  // ---- Save all changes ----

  const saveChanges = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      const hasNewProjects = projects.some(p => p.id.startsWith('temp_'));
      const hasNewExhibitions = exhibitions.some(e => e.id.startsWith('temp_'));

      await syncProjects(projectsSnapshot, projects);
      await syncExhibitions(exhibitionsSnapshot, exhibitions);

      // Only re-fetch if there were new items (need real IDs from server)
      if (hasNewProjects || hasNewExhibitions) {
        await Promise.all([fetchProjects(), fetchExhibitions()]);
      } else {
        // No new items - just reset snapshots to local state
        resetProjectsSnapshot(projects);
        resetExhibitionsSnapshot(exhibitions);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '저장 실패';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSaving(false);
    }
  }, [projects, exhibitions, projectsSnapshot, exhibitionsSnapshot, fetchProjects, fetchExhibitions, resetProjectsSnapshot, resetExhibitionsSnapshot]);

  // ---- Initialize ----

  const initializeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/admin/work/init', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '초기화 실패');
      await Promise.all([fetchProjects(), fetchExhibitions()]);
      return data.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '초기화 실패';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects, fetchExhibitions]);

  return {
    projects,
    exhibitions,
    isLoading,
    isSaving,
    isDirty,
    changeCount,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    reorderProject,
    fetchExhibitions,
    addExhibition,
    updateExhibition,
    deleteExhibition,
    reorderExhibition,
    saveChanges,
    revert,
    initializeData,
    clearError,
  };
}

// ---- Helpers for saveChanges ----

async function syncProjects(
  snapItems: WorkProjectData[],
  localItems: WorkProjectData[]
) {
  const localIds = new Set(localItems.map((i) => i.id));
  const snapMap = new Map(snapItems.map((i) => [i.id, i]));

  // 1. Delete: parallel
  const toDelete = snapItems.filter(item => !localIds.has(item.id));
  if (toDelete.length > 0) {
    await Promise.all(toDelete.map(item =>
      fetch(`/api/admin/work/projects/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(res => { if (!res.ok) throw new Error('프로젝트 삭제 실패'); })
    ));
  }

  // 2. Create: parallel
  const toCreate = localItems.filter(item => item.id.startsWith('temp_'));
  if (toCreate.length > 0) {
    await Promise.all(toCreate.map(item =>
      fetch('/api/admin/work/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          subtitle: item.subtitle,
          category: item.category,
          tags: item.tags,
          author: item.author,
          email: item.email,
          description: item.description,
          year: item.year,
          heroImage: item.heroImage,
          thumbnailImage: item.thumbnailImage,
          galleryImages: item.galleryImages,
          published: item.published,
          content: item.content,
        }),
        credentials: 'include',
      }).then(res => { if (!res.ok) throw new Error('프로젝트 생성 실패'); })
    ));
  }

  // 3. Update: parallel
  const toUpdate = localItems.filter(item => {
    if (item.id.startsWith('temp_')) return false;
    const orig = snapMap.get(item.id);
    return orig && !deepEqual(orig, item);
  });
  if (toUpdate.length > 0) {
    await Promise.all(toUpdate.map(item =>
      fetch(`/api/admin/work/projects/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          subtitle: item.subtitle,
          category: item.category,
          tags: item.tags,
          author: item.author,
          email: item.email,
          description: item.description,
          year: item.year,
          heroImage: item.heroImage,
          thumbnailImage: item.thumbnailImage,
          galleryImages: item.galleryImages,
          published: item.published,
          content: item.content,
        }),
        credentials: 'include',
      }).then(res => { if (!res.ok) throw new Error('프로젝트 수정 실패'); })
    ));
  }

  // 4. Reorder: single batch call
  const reorderItems: { id: string; order: number }[] = [];
  for (let i = 0; i < localItems.length; i++) {
    const item = localItems[i];
    if (item.id.startsWith('temp_')) continue;
    const orig = snapMap.get(item.id);
    if (orig && orig.order !== i) {
      reorderItems.push({ id: item.id, order: i });
    }
  }
  if (reorderItems.length > 0) {
    const res = await fetch('/api/admin/work/projects/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: reorderItems }),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('프로젝트 순서 변경 실패');
  }
}

async function syncExhibitions(
  snapItems: WorkExhibitionData[],
  localItems: WorkExhibitionData[]
) {
  const localIds = new Set(localItems.map((i) => i.id));
  const snapMap = new Map(snapItems.map((i) => [i.id, i]));

  // 1. Delete: parallel
  const toDelete = snapItems.filter(item => !localIds.has(item.id));
  if (toDelete.length > 0) {
    await Promise.all(toDelete.map(item =>
      fetch(`/api/admin/work/exhibitions/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(res => { if (!res.ok) throw new Error('전시 삭제 실패'); })
    ));
  }

  // 2. Create: parallel
  const toCreate = localItems.filter(item => item.id.startsWith('temp_'));
  if (toCreate.length > 0) {
    await Promise.all(toCreate.map(item =>
      fetch('/api/admin/work/exhibitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          subtitle: item.subtitle,
          artist: item.artist,
          image: item.image,
          year: item.year,
          published: item.published,
          showOnHome: item.showOnHome,
        }),
        credentials: 'include',
      }).then(res => { if (!res.ok) throw new Error('전시 생성 실패'); })
    ));
  }

  // 3. Update: parallel
  const toUpdate = localItems.filter(item => {
    if (item.id.startsWith('temp_')) return false;
    const orig = snapMap.get(item.id);
    return orig && !deepEqual(orig, item);
  });
  if (toUpdate.length > 0) {
    await Promise.all(toUpdate.map(item =>
      fetch(`/api/admin/work/exhibitions/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          subtitle: item.subtitle,
          artist: item.artist,
          image: item.image,
          year: item.year,
          published: item.published,
          showOnHome: item.showOnHome,
        }),
        credentials: 'include',
      }).then(res => { if (!res.ok) throw new Error('전시 수정 실패'); })
    ));
  }

  // 4. Reorder: single batch call
  const reorderItems: { id: string; order: number }[] = [];
  for (let i = 0; i < localItems.length; i++) {
    const item = localItems[i];
    if (item.id.startsWith('temp_')) continue;
    const orig = snapMap.get(item.id);
    if (orig && orig.order !== i) {
      reorderItems.push({ id: item.id, order: i });
    }
  }
  if (reorderItems.length > 0) {
    const res = await fetch('/api/admin/work/exhibitions/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: reorderItems }),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('전시 순서 변경 실패');
  }
}
