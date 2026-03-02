'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;

    // Skip animation for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    const tl = gsap.timeline({ onComplete });
    tl.to(screen, { opacity: 0, duration: 0.3, ease: 'power2.inOut', delay: 3 });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={screenRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
    >
      <span
        style={{
          fontSize: '24px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          color: '#000',
          letterSpacing: '4px',
        }}
      >
        SMVD
      </span>
    </div>
  );
}
