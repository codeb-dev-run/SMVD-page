'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ExhibitionItem {
  year: string;
  src: string;
  alt: string;
  title?: string;
}

interface ExhibitionSectionProps {
  items?: ExhibitionItem[];
}

export default function ExhibitionSection({
  items = [
    {
      year: '2025',
      src: '/images/home/exhibition-2025.png',
      alt: 'SMVD Grad Exhibition 2025',
    },
    {
      year: '2024',
      src: '/images/home/exhibition-2024.png',
      alt: 'Visual Media Design Graduation Show 2024',
    },
    {
      year: '2023',
      src: '/images/home/exhibition-2023.png',
      alt: 'Kickoff 2023',
    },
  ],
}: ExhibitionSectionProps) {
  const sectionRef = useScrollReveal({
    selector: '[data-exhibition-card]',
    stagger: 0.15,
    x: -30,
    y: 0,
    duration: 0.6,
    start: 'top 80%',
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,
    startTranslate: 0,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  // Get current translateX using GSAP's internal state
  const getCurrentTranslate = useCallback(() => {
    if (!trackRef.current) return 0;
    return gsap.getProperty(trackRef.current, 'x') as number;
  }, []);

  // Calculate max drag distance
  const getMaxTranslate = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    const trackWidth = trackRef.current.scrollWidth;
    return Math.min(0, containerWidth - trackWidth);
  }, []);

  // Clamp and animate to position
  const animateTo = useCallback((x: number, duration = 0.4) => {
    if (!trackRef.current) return;
    const maxTranslate = getMaxTranslate();
    const clamped = Math.max(maxTranslate, Math.min(0, x));
    gsap.to(trackRef.current, {
      x: clamped,
      duration,
      ease: 'power3.out',
    });
  }, [getMaxTranslate]);

  // Mouse handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const state = dragState.current;
    state.isDragging = true;
    state.startX = e.clientX;
    state.currentX = e.clientX;
    state.startTranslate = getCurrentTranslate();
    state.velocity = 0;
    state.lastX = e.clientX;
    state.lastTime = Date.now();
    setIsDragging(true);

    // Stop any ongoing animation
    if (trackRef.current) gsap.killTweensOf(trackRef.current);

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [getCurrentTranslate]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const state = dragState.current;
    if (!state.isDragging || !trackRef.current) return;

    const dx = e.clientX - state.startX;
    const newX = state.startTranslate + dx;
    const maxTranslate = getMaxTranslate();

    // Rubber-band effect at edges
    let clampedX: number;
    if (newX > 0) {
      clampedX = newX * 0.3; // Resistance at left edge
    } else if (newX < maxTranslate) {
      clampedX = maxTranslate + (newX - maxTranslate) * 0.3; // Resistance at right edge
    } else {
      clampedX = newX;
    }

    gsap.set(trackRef.current, { x: clampedX });

    // Track velocity for momentum
    const now = Date.now();
    const dt = now - state.lastTime;
    if (dt > 0) {
      state.velocity = (e.clientX - state.lastX) / dt * 1000; // px/s
    }
    state.lastX = e.clientX;
    state.lastTime = now;
    state.currentX = e.clientX;
  }, [getMaxTranslate]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const state = dragState.current;
    if (!state.isDragging) return;
    state.isDragging = false;
    setIsDragging(false);

    const dx = e.clientX - state.startX;

    // If barely moved (click, not drag), keep current position
    if (Math.abs(dx) < 5) return;

    const currentTranslate = getCurrentTranslate();

    // Apply momentum
    const momentum = state.velocity * 0.3; // 300ms of momentum
    const targetX = currentTranslate + momentum;

    animateTo(targetX, Math.abs(momentum) > 500 ? 0.6 : 0.4);
  }, [getCurrentTranslate, animateTo]);

  // Card hover animation: dark gradient overlay + title text fade-in (Figma spec)
  const handleCardEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const overlay = e.currentTarget.querySelector('[data-exhibition-overlay]');
    const title = e.currentTarget.querySelector('[data-exhibition-title]');
    if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    if (title) gsap.to(title, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  }, [isDragging]);

  const handleCardLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const overlay = e.currentTarget.querySelector('[data-exhibition-overlay]');
    const title = e.currentTarget.querySelector('[data-exhibition-title]');
    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    if (title) gsap.to(title, { opacity: 0, y: 8, duration: 0.3, ease: 'power2.out' });
  }, []);

  // Prevent default drag on images
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const preventDrag = (e: Event) => e.preventDefault();
    track.addEventListener('dragstart', preventDrag);
    return () => track.removeEventListener('dragstart', preventDrag);
  }, []);

  return (
    <section ref={sectionRef} id="exhibition" className="flex flex-col gap-5 sm:gap-6 lg:gap-10 w-full mb-10 sm:mb-[60px] lg:mb-20">
      {/* Exhibition Header */}
      <div className="flex justify-between items-center border-b border-[#141414ff] pb-5">
        <h2 className="text-[20px] sm:text-[24px] lg:text-[32px] font-bold font-['Helvetica'] text-[#141414ff] m-0">
          Exhibition
        </h2>
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className={`text-[12px] font-normal font-['Helvetica'] text-[#999] ${items.length <= 3 ? 'lg:hidden' : ''} ${items.length <= 2 ? 'sm:hidden' : ''} ${items.length <= 1 ? 'hidden' : ''}`}>
            ← drag →
          </span>
          <a href="#" className="text-[14px] font-normal font-['Helvetica'] text-[#141414ff] no-underline">
            More →
          </a>
        </div>
      </div>

      {/* Exhibition Items - Horizontal Scrollable Track */}
      <div
        ref={containerRef}
        role="region"
        aria-label="전시 갤러리"
        className={`overflow-hidden w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} touch-pan-y`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={trackRef}
          className="flex gap-5 sm:gap-6 lg:gap-10 will-change-transform"
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              data-exhibition-card
              className="flex-none flex flex-col gap-5 select-none w-full sm:w-[calc(50%-12px)] lg:w-[calc((100%-80px)/3)] cursor-pointer"
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleCardLeave}
            >
                {/* Year Indicator */}
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-normal font-['Helvetica'] text-[#141414ff]">
                    {item.year}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 14L14 2M14 2H6M14 2V10"
                      stroke="#141414ff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Exhibition Image */}
                <div data-exhibition-img className="relative w-full aspect-9/13 bg-[#f5f5f5ff] overflow-hidden rounded-none">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      objectFit: 'cover',
                      pointerEvents: 'none',
                    }}
                    priority={idx === 0}
                    draggable={false}
                    quality={80}
                  />
                  {/* Hover: bottom gradient overlay for text readability */}
                  <div
                    data-exhibition-overlay
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      opacity: 0,
                      background: 'linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.65) 100%)',
                    }}
                  />
                  {/* Hover: exhibition title */}
                  <p
                    data-exhibition-title
                    className="absolute bottom-5 left-5 text-white text-[18px] sm:text-[22px] lg:text-[28px] font-bold m-0 pointer-events-none"
                    style={{ opacity: 0, transform: 'translateY(8px)', fontFamily: 'var(--font-heading)' }}
                  >
                    {item.title || `${item.year} Exhibition`}
                  </p>
                </div>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
}
