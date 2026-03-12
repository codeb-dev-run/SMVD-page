'use client';

import { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';
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

const YOUTUBE_IDS = {
  default: '7DSRtwpvcvs', // bg_circle
  hover: '2WchrTJwRUM',   // bg_wave
};

const youtubeEmbedUrl = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&showinfo=0&enablejsapi=1`;

export default function VideoHero({ animateOnMount = true, className }: VideoHeroProps) {
  const [glassMode, setGlassMode] = useState<'A' | 'B' | 'C'>('A');
  const [barrelMapUrl, setBarrelMapUrl] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverVideoRef = useRef<HTMLVideoElement>(null);
  const magnifierRef = useRef<HTMLDivElement>(null);
  const magnifierInnerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isActive = useRef(false);
  const hoverYtRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const glassModeRef = useRef<'A' | 'B' | 'C'>('A');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayersRef = useRef<any[]>([]);
  const ytIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate barrel distortion displacement map (convex lens)
  useEffect(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(size, size);
    const d = imgData.data;
    const c = size / 2;

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const nx = (px - c) / c; // -1 ~ 1
        const ny = (py - c) / c;
        const r2 = nx * nx + ny * ny;

        // Barrel distortion: displacement ∝ r² (quadratic), direction = outward from center
        const k = 70;
        const i = (py * size + px) * 4;
        d[i]     = Math.min(255, Math.max(0, Math.round(128 + nx * r2 * k))); // R → X displacement
        d[i + 1] = Math.min(255, Math.max(0, Math.round(128 + ny * r2 * k))); // G → Y displacement
        d[i + 2] = 128;
        d[i + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setBarrelMapUrl(canvas.toDataURL());
  }, []);

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

  // Sync glassModeRef + reset on mode change
  useEffect(() => {
    glassModeRef.current = glassMode;
    if (isActive.current) {
      isActive.current = false;
      containerRef.current?.style.setProperty('cursor', 'default');
      if (hoverVideoRef.current) gsap.set(hoverVideoRef.current, { opacity: 0 });
      if (hoverYtRef.current) gsap.set(hoverYtRef.current, { opacity: 0 });
      if (magnifierRef.current) gsap.set(magnifierRef.current, { display: 'none', opacity: 0 });
    }
  }, [glassMode]);

  // YouTube IFrame API: seamless loop (seek before end to avoid blackout)
  useEffect(() => {
    if (glassMode !== 'C') {
      if (ytIntervalRef.current) { clearInterval(ytIntervalRef.current); ytIntervalRef.current = null; }
      ytPlayersRef.current = [];
      return;
    }

    let cancelled = false;

    const loadAPI = (): Promise<void> => new Promise((resolve) => {
      if ((window as unknown as Record<string, unknown>).YT &&
          typeof ((window as unknown as Record<string, unknown>).YT as Record<string, unknown>).Player === 'function') {
        resolve(); return;
      }
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      const check = setInterval(() => {
        if ((window as unknown as Record<string, unknown>).YT &&
            typeof ((window as unknown as Record<string, unknown>).YT as Record<string, unknown>).Player === 'function') {
          clearInterval(check); resolve();
        }
      }, 100);
    });

    const init = async () => {
      await loadAPI();
      if (cancelled) return;
      // Wait for iframes to be in DOM and ready
      await new Promise(r => setTimeout(r, 2000));
      if (cancelled) return;

      const YT = (window as unknown as Record<string, unknown>).YT as Record<string, unknown>;
      const PlayerCtor = YT.Player as new (id: string) => Record<string, unknown>;
      const ids = ['yt-default-bg', 'yt-hover-bg', 'yt-magnifier-bg'];
      const players = ids
        .map(id => { try { return document.getElementById(id) ? new PlayerCtor(id) : null; } catch { return null; } })
        .filter((p): p is Record<string, unknown> => p !== null);

      if (cancelled) return;
      ytPlayersRef.current = players;

      // Poll: seek to start when approaching end (avoids YouTube loop blackout)
      ytIntervalRef.current = setInterval(() => {
        players.forEach((player: Record<string, unknown>) => {
          try {
            const t = (player.getCurrentTime as () => number)();
            const d = (player.getDuration as () => number)();
            if (d > 0 && d - t < 0.5) {
              (player.seekTo as (s: number, a: boolean) => void)(0.1, true);
            }
          } catch { /* player not ready yet */ }
        });
      }, 200);
    };

    init();

    return () => {
      cancelled = true;
      if (ytIntervalRef.current) { clearInterval(ytIntervalRef.current); ytIntervalRef.current = null; }
      ytPlayersRef.current = [];
    };
  }, [glassMode]);

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
    if (hoverYtRef.current) gsap.killTweensOf(hoverYtRef.current);
    gsap.killTweensOf(mag);

    gsap.set(mag, { left: x, top: y, opacity: 0, display: 'block' });
    gsap.set(inner, { x: -(x * MAGNIFICATION) + half, y: -(y * MAGNIFICATION) + half });

    const hoverTarget = glassModeRef.current === 'C' ? hoverYtRef.current : hoverVideoRef.current;
    // Start hover video playback on first activate (lazy loaded with preload="none")
    if (glassModeRef.current !== 'C' && hoverVideoRef.current && hoverVideoRef.current.paused) {
      hoverVideoRef.current.play().catch(() => {});
    }
    if (hoverTarget) gsap.to(hoverTarget, { opacity: 1, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' });
    if (vignetteRef.current) gsap.to(vignetteRef.current, { opacity: 0, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' });
    gsap.to(mag, { opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.1, overwrite: 'auto' });
  }, []);

  // Deactivate: restore default video
  const deactivate = useCallback(() => {
    isActive.current = false;
    containerRef.current?.style.setProperty('cursor', 'default');

    // Kill any ongoing tweens to prevent conflicts
    if (hoverVideoRef.current) gsap.killTweensOf(hoverVideoRef.current);
    if (hoverYtRef.current) gsap.killTweensOf(hoverYtRef.current);
    if (magnifierRef.current) gsap.killTweensOf(magnifierRef.current);

    const hoverTarget = glassModeRef.current === 'C' ? hoverYtRef.current : hoverVideoRef.current;
    if (hoverTarget) gsap.to(hoverTarget, { opacity: 0, duration: 0.4, ease: 'power2.inOut', overwrite: 'auto' });
    if (vignetteRef.current) gsap.to(vignetteRef.current, { opacity: 1, duration: 0.4, ease: 'power2.inOut', overwrite: 'auto' });
    if (magnifierRef.current) {
      gsap.to(magnifierRef.current, {
        opacity: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto',
        onComplete: () => {
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
      <div className="absolute top-6 sm:top-10 lg:top-20 left-5 sm:left-10 lg:left-10">
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
      <div className="absolute bottom-[28%] sm:bottom-[25%] lg:bottom-[220px] right-5 sm:right-10 lg:right-10 text-right">
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
      className={`relative w-full h-[40vh] sm:h-[50vh] lg:h-[949px] overflow-hidden mb-10 bg-white${className ? ` ${className}` : ''}`}
    >
      {/* SVG filter for Mockup A: barrel distortion via displacement map */}
      {barrelMapUrl && (
        <svg width="0" height="0" className="absolute">
          <defs>
            <filter id="convex-lens" x="-10%" y="-10%" width="120%" height="120%">
              <feImage href={barrelMapUrl} result="dispMap" width="100%" height="100%" preserveAspectRatio="none" />
              <feDisplacementMap in="SourceGraphic" in2="dispMap" scale="45" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
      )}

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
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0 }}
      >
        <source src="/videos/hero-hover.webm" type="video/webm" />
        <source src="/videos/hero-hover.mp4" type="video/mp4" />
      </video>

      {/* White vignette overlay to shrink visible circle for 시안 A/B */}
      {glassMode !== 'C' && (
        <div ref={vignetteRef} className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at center, transparent 20%, white 40%)',
        }} />
      )}

      {/* YouTube default (circle) — 시안 C */}
      {glassMode === 'C' && (
        <div className="absolute inset-0 overflow-hidden bg-white">
          <iframe
            id="yt-default-bg"
            src={youtubeEmbedUrl(YOUTUBE_IDS.default)}
            className="absolute inset-0 w-full h-full border-0"
            style={{ pointerEvents: 'none', transform: 'scale(1.8)', transformOrigin: 'center center' }}
            allow="autoplay; encrypted-media"
            title="Hero default background"
          />
          {/* White vignette frame to shrink visible circle area (circle for true round shape) */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(circle at center, transparent 15%, white 30%)',
          }} />
        </div>
      )}

      {/* YouTube hover (wave) — 시안 C: no vignette, full edge-to-edge */}
      {glassMode === 'C' && (
        <div
          ref={hoverYtRef}
          className="absolute inset-0 overflow-hidden bg-white"
          style={{ opacity: 0 }}
        >
          <iframe
            id="yt-hover-bg"
            src={youtubeEmbedUrl(YOUTUBE_IDS.hover)}
            className="absolute inset-0 w-full h-full border-0"
            style={{ pointerEvents: 'none', transform: 'scale(1.8)', transformOrigin: 'center center' }}
            allow="autoplay; encrypted-media"
            title="Hero hover wave"
          />
        </div>
      )}

      {/* Text layer */}
      <div ref={textRef} className="absolute inset-0 pointer-events-none">
        <div className="max-w-[1440px] mx-auto relative w-full h-full">
          {typography(true)}
        </div>
      </div>

      {/* Magnifier — display:none by default */}
      <div
        ref={magnifierRef}
        className="absolute pointer-events-none rounded-full overflow-hidden w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] lg:w-[200px] lg:h-[200px]"
        style={{
          display: 'none',
          opacity: 0,
          transform: 'translate(-50%, -50%)',
          boxShadow: glassMode === 'A'
            ? '0 4px 24px rgba(0,0,0,0.15), inset 0 0 8px rgba(255,255,255,0.1)'
            : '0 4px 24px rgba(0, 0, 0, 0.12)',
          border: glassMode === 'A' ? '1.5px solid rgba(255,255,255,0.25)' : '1px solid rgba(255, 255, 255, 0.25)',
          filter: glassMode === 'A' ? 'url(#convex-lens)' : undefined,
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
          {glassMode === 'C' ? (
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                id="yt-magnifier-bg"
                src={youtubeEmbedUrl(YOUTUBE_IDS.hover)}
                className="absolute border-0"
                style={{ top: '-5%', left: '-5%', width: '110%', height: '110%', pointerEvents: 'none' }}
                allow="autoplay; encrypted-media"
                title="Magnifier hover"
              />
            </div>
          ) : (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/videos/hero-hover.webm" type="video/webm" />
              <source src="/videos/hero-hover.mp4" type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 pointer-events-none">
            {typography(false)}
          </div>
        </div>
        {/* Convex lens visual cues (Mode A): vignette + glass highlight */}
        {glassMode === 'A' && (
          <>
            {/* Vignette: edges darken like real lens */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle, transparent 45%, rgba(0,0,0,0.12) 70%, rgba(0,0,0,0.3) 100%)',
                pointerEvents: 'none',
              }}
            />
            {/* Glass specular highlight: diagonal white reflection */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 30%, transparent 50%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
        {/* Mockup B: blur feathering overlay */}
        {glassMode === 'B' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, transparent 50%, rgba(255,255,255,0.6) 85%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              mask: 'radial-gradient(circle, transparent 55%, black 80%)',
              WebkitMask: 'radial-gradient(circle, transparent 55%, black 80%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Toggle UI */}
      <div className="absolute bottom-4 right-5 sm:right-10 lg:right-10 flex gap-2 z-20">
        <button
          onClick={() => setGlassMode('A')}
          className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
            glassMode === 'A' ? 'bg-black text-white border-black' : 'bg-white/80 text-black border-gray-300 hover:bg-white'
          }`}
        >
          시안 A
        </button>
        <button
          onClick={() => setGlassMode('B')}
          className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
            glassMode === 'B' ? 'bg-black text-white border-black' : 'bg-white/80 text-black border-gray-300 hover:bg-white'
          }`}
        >
          시안 B
        </button>
        <button
          onClick={() => setGlassMode('C')}
          className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
            glassMode === 'C' ? 'bg-black text-white border-black' : 'bg-white/80 text-black border-gray-300 hover:bg-white'
          }`}
        >
          시안 C (YT)
        </button>
      </div>
    </div>
  );
}
