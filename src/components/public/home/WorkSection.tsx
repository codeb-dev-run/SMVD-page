'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface WorkItem {
  src: string;
  alt: string;
  title: string;
  category: string;
}

interface WorkSectionProps {
  title?: string;
  items?: WorkItem[];
}

const workItems: WorkItem[] = [
  { src: '/images/mainpage-work/vora.png', alt: 'Vora', title: 'Vora', category: 'Motion' },
  { src: '/images/mainpage-work/bichae.png', alt: 'BICHAE', title: 'BICHAE', category: 'Branding' },
  { src: '/images/mainpage-work/starnew valley.png', alt: 'StarNew Valley', title: 'StarNew Valley', category: 'Game' },
  { src: '/images/mainpage-work/pave.png', alt: 'Pave', title: 'Pave', category: 'UX/UI' },
  { src: '/images/mainpage-work/bolio.png', alt: 'Bolio', title: 'Bolio', category: 'UX/UI' },
  { src: '/images/mainpage-work/morae.png', alt: 'Morae', title: 'Morae', category: 'UX/UI' },
  { src: '/images/mainpage-work/mist away.png', alt: 'MIST AWAY', title: 'MIST AWAY', category: 'Branding' },
  { src: '/images/mainpage-work/nightmare in neverland.png', alt: 'Nightmare in Neverland', title: 'Nightmare in Neverland', category: 'Motion' },
  { src: '/images/mainpage-work/고군분투.png', alt: '고군분쿠', title: '고군분쿠', category: 'Game' },
  { src: '/images/mainpage-work/시도.png', alt: '시도', title: '시도', category: 'Graphic' },
];

const categories = ['All', 'UX/UI', 'Motion', 'Branding', 'Game design', 'Graphic'];

export default function WorkSection({
  title = 'Work',
  items = workItems,
}: WorkSectionProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const gridRef = useScrollReveal({ selector: '[data-work-card]', stagger: 0.1, y: 50 });

  const handleCardEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.to(e.currentTarget, { y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.1)', duration: 0.3, ease: 'power2.out' });
  }, []);

  const handleCardLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: 0, boxShadow: '0 0px 0px rgba(0,0,0,0)', duration: 0.25, ease: 'power2.out' });
  }, []);

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item =>
        item.category === activeCategory ||
        (activeCategory === 'Game design' && item.category === 'Game')
      );

  const totalRows = Math.ceil(filteredItems.length / 2);

  const filterButtons = (textClass: string, isVertical: boolean) =>
    categories.map((category) => {
      const isActive = activeCategory === category;
      return (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`flex items-center gap-[6px] font-normal font-sans tracking-[0.4px] leading-normal whitespace-nowrap border-none cursor-pointer transition-all duration-200 ease-in-out ${isActive ? 'py-1 px-2.5 bg-[#000000ff] text-[#ffffffff] opacity-100' : 'py-1 px-0 bg-transparent text-[#3b3b3bff] opacity-50'} ${textClass}`}
        >
          {isActive && (
            <img
              src="/images/check.svg"
              alt="selected"
              width={isVertical ? 14 : 10}
              height={isVertical ? 16 : 12}
              className="shrink-0"
            />
          )}
          {category}
        </button>
      );
    });

  return (
    <section
      id="work"
      className="w-full bg-[#ffffffff] border-t border-[#adadadff] pt-8 sm:pt-12 lg:pt-[61px] pb-8 sm:pb-12 lg:pb-[61px] px-4 sm:px-6 lg:px-10"
    >
      {/* Header */}
      <div className="w-full max-w-[1440px] mx-auto mb-8 sm:mb-12 flex items-center justify-between border-b border-[#adadadff] flex-col sm:flex-row gap-3 sm:gap-0">
        <h2 className="text-[28px] sm:text-[40px] lg:text-[48px] font-medium text-[#000000ff] font-sans m-0 tracking-[-0.128px] leading-normal pb-3 sm:pb-0 w-full sm:w-auto">
          {title}
        </h2>
        <div className="hidden sm:flex items-center gap-1">
          <span className="text-[14px] sm:text-[16px] lg:text-[18px] font-normal text-[#000000ff] font-sans tracking-[-0.439px] leading-normal">
            More
          </span>
          <img src="/images/icon/Right-3.svg" alt="more" width={14} height={14} />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-[1440px] mx-auto">
        {/* Mobile/Tablet filter (horizontal, on top) */}
        <div className="flex lg:hidden flex-row gap-2 overflow-x-auto pb-2 mb-6">
          {filterButtons('text-[18px] sm:text-[22px]', false)}
        </div>

        {/* Grid: 3-col on desktop (col1=cards, col2=filter sticky, col3=cards), 2-col tablet, 1-col mobile */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] gap-x-0 sm:gap-x-8 lg:gap-x-[50px] gap-y-6 sm:gap-y-8 lg:gap-y-10">
          {/* Desktop: center filter in grid col 2, sticky */}
          <div
            className="hidden lg:flex flex-col gap-[2px] col-start-2 sticky top-[100px] self-start pt-1"
            style={{ gridRow: `1 / ${totalRows + 1}` }}
          >
            {filterButtons('text-[32px]', true)}
          </div>

          {/* Cards: explicit grid placement on desktop, auto-flow on mobile/tablet */}
          {filteredItems.map((item, idx) => (
            <div
              key={item.title}
              data-work-card
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleCardLeave}
              className="flex flex-col lg:col-(--desk-col) lg:row-(--desk-row) cursor-pointer"
              style={{
                '--desk-col': idx % 2 === 0 ? '1' : '3',
                '--desk-row': `${Math.floor(idx / 2) + 1}`,
              } as React.CSSProperties}
            >
              <div className="relative w-full aspect-4/3 bg-[#e1e1e1ff] overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  style={{ objectFit: 'cover' }}
                  quality={75}
                />
              </div>
              <div className="flex justify-between items-center pt-3">
                <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-medium text-[#000000ff] font-sans m-0 tracking-[-0.449px] leading-normal">
                  {item.title}
                </h3>
                <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-normal text-[#000000ff] font-sans opacity-60 leading-normal shrink-0 ml-3">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
