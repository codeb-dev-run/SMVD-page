'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface UseScrollRevealOptions {
  selector?: string;
  stagger?: number;
  y?: number;
  x?: number;
  duration?: number;
  start?: string;
  ease?: string;
}

export function useScrollReveal({
  selector,
  stagger = 0.1,
  y = 50,
  x = 0,
  duration = 0.8,
  start = 'top 85%',
  ease = 'power2.out',
}: UseScrollRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = selector ? el.querySelectorAll(selector) : [el];
    if (targets.length === 0) return;

    gsap.set(targets, { opacity: 0, y, x });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          x: 0,
          duration,
          stagger,
          ease,
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [selector, stagger, y, x, duration, start, ease]);

  return ref;
}
