'use client';

import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Hero section flow:
 * 1. Default: hero-default.mp4 (circle blob) + text (no glass overlay)
 * 2. Hover on center text: crossfade to hero-hover.mp4 (wave) + magnifier follows mouse
 * 3. Leave text area: crossfade back to default video
 */

interface VideoHeroProps {
  animateOnMount?: boolean;
  className?: string;
}

const MAGNIFICATION = 1.2;

export default function VideoHero({ animateOnMount = true, className }: VideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverVideoRef = useRef<HTMLVideoElement>(null);
  const magnifierRef = useRef<HTMLDivElement>(null);
  const magnifierInnerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isActive = useRef(false);

  // Force-reset on mount/HMR
  useLayoutEffect(() => {
    isActive.current = false;
    const mag = magnifierRef.current;
    if (mag) {
      mag.style.display = 'none';
      mag.style.opacity = '0';
      mag.style.left = '';
      mag.style.top = '';
    }
    if (hoverVideoRef.current) {
      hoverVideoRef.current.style.opacity = '0';
    }
  }, []);

  // Text fade-in
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { gsap.set(el, { opacity: 1 }); return; }

    gsap.set(el, { opacity: 0 });
    if (!animateOnMount) return;

    const tween = gsap.to(el, { opacity: 1, duration: 0.5, ease: 'power2.inOut', delay: 0.3 });
    return () => { tween.kill(); };
  }, [animateOnMount]);

  // Keep magnifier inner size synced with container
  useEffect(() => {
    const container = containerRef.current;
    const inner = magnifierInnerRef.current;
    if (!container || !inner) return;

    const sync = () => {
      inner.style.width = container.offsetWidth + 'px';
      inner.style.height = container.offsetHeight + 'px';
    };
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Check if mouse is over the center title
  const isOverTitle = useCallback((clientX: number, clientY: number) => {
    const title = titleRef.current;
    if (!title) return false;
    const r = title.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }, []);

  // Activate: swap video + show magnifier
  const activate = useCallback((x: number, y: number, half: number, mag: HTMLDivElement, inner: HTMLDivElement) => {
    isActive.current = true;
    containerRef.current?.style.setProperty('cursor', 'none');

    // Kill any ongoing tweens to prevent conflicts
    if (hoverVideoRef.current) gsap.killTweensOf(hoverVideoRef.current);
    gsap.killTweensOf(mag);

    gsap.set(mag, { left: x, top: y, opacity: 0, display: 'block' });
    gsap.set(inner, { x: -(x * MAGNIFICATION) + half, y: -(y * MAGNIFICATION) + half });

    if (hoverVideoRef.current) gsap.to(hoverVideoRef.current, { opacity: 1, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' });
    gsap.to(mag, { opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.1, overwrite: 'auto' });
  }, []);

  // Deactivate: restore default video
  const deactivate = useCallback(() => {
    isActive.current = false;
    containerRef.current?.style.setProperty('cursor', 'default');

    // Kill any ongoing tweens to prevent conflicts
    if (hoverVideoRef.current) gsap.killTweensOf(hoverVideoRef.current);
    if (magnifierRef.current) gsap.killTweensOf(magnifierRef.current);

    if (hoverVideoRef.current) gsap.to(hoverVideoRef.current, { opacity: 0, duration: 0.4, ease: 'power2.inOut', overwrite: 'auto' });
    if (magnifierRef.current) {
      gsap.to(magnifierRef.current, {
        opacity: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto',
        onComplete: () => {
          // Guard: only hide if still deactivated (user may have re-entered)
          if (!isActive.current && magnifierRef.current) gsap.set(magnifierRef.current, { display: 'none' });
        },
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = containerRef.current;
    const mag = magnifierRef.current;
    const inner = magnifierInnerRef.current;
    if (!container || !mag || !inner) return;

    const overTitle = isOverTitle(e.clientX, e.clientY);

    if (overTitle && !isActive.current) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const half = mag.offsetWidth / 2;
      activate(x, y, half, mag, inner);
      return;
    }

    if (!overTitle && isActive.current) {
      deactivate();
      return;
    }

    if (isActive.current) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const half = mag.offsetWidth / 2;

      gsap.to(mag, { left: x, top: y, duration: 0.12, ease: 'power2.out', overwrite: 'auto' });
      gsap.set(inner, { x: -(x * MAGNIFICATION) + half, y: -(y * MAGNIFICATION) + half });
    }
  }, [isOverTitle, activate, deactivate]);

  const handleMouseLeave = useCallback(() => {
    if (isActive.current) deactivate();
  }, [deactivate]);

  // Shared typography JSX
  const typography = (isMainLayer: boolean) => (
    <>
      <div className="absolute top-6 sm:top-10 lg:top-20 left-5 sm:left-10 lg:left-[55px]">
        <p
          className="text-[11px] sm:text-[13px] lg:text-[16px] text-black leading-[1.4] m-0"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}
        >
          {"SOOKMYUNG WOMEN'S UNIVERSITY"}
          <br />
          VISUAL MEDIA DESIGN
        </p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <h1
          ref={isMainLayer ? titleRef : undefined}
          className="text-[28px] sm:text-[56px] lg:text-[96px] text-black tracking-[-1px] m-0 select-none whitespace-nowrap"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
        >
          Visual Media Design
        </h1>
      </div>
      <div className="absolute bottom-[28%] sm:bottom-[25%] lg:bottom-[220px] right-5 sm:right-10 lg:right-[55px] text-right">
        <p
          className="text-[11px] sm:text-[13px] lg:text-[16px] text-black leading-[1.4] m-0"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
        >
          SMVD
          <br />
          SOLVING PROBLEMS,
          <br />
          SHAPING THE FUTURE OF VISUALS
        </p>
      </div>
    </>
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-[40vh] sm:h-[50vh] lg:h-[949px] overflow-hidden mb-6 sm:mb-8 lg:mb-10${className ? ` ${className}` : ''}`}
    >
      {/* Default video (circle blob) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-default.webm" type="video/webm" />
        <source src="/videos/hero-default.mp4" type="video/mp4" />
      </video>

      {/* Hover video (wave) - fades in when mouse over title */}
      <video
        ref={hoverVideoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0 }}
      >
        <source src="/videos/hero-hover.webm" type="video/webm" />
        <source src="/videos/hero-hover.mp4" type="video/mp4" />
      </video>

      {/* Text layer */}
      <div ref={textRef} className="absolute inset-0 pointer-events-none">
        {typography(true)}
      </div>

      {/* Magnifier — display:none by default */}
      <div
        ref={magnifierRef}
        className="absolute pointer-events-none rounded-full overflow-hidden w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] lg:w-[400px] lg:h-[400px]"
        style={{
          display: 'none',
          opacity: 0,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <div
          ref={magnifierInnerRef}
          className="absolute will-change-transform"
          style={{
            transform: `scale(${MAGNIFICATION})`,
            transformOrigin: '0 0',
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hero-hover.webm" type="video/webm" />
            <source src="/videos/hero-hover.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 pointer-events-none">
            {typography(false)}
          </div>
        </div>
      </div>
    </div>
  );
}
