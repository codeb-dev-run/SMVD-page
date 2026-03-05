'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface WorkItem {
  src: string;
  alt: string;
  title: string;
  category: string;
  slug?: string | null;
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
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [showFloatingLabel, setShowFloatingLabel] = useState(false);
  const isCycling = useRef(false);
  const sectionTriggerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationDoneRef = useRef(false);

  // Floating label: show when header scrolls out, hide when section leaves
  useEffect(() => {
    const header = headerRef.current;
    const section = sectionTriggerRef.current;
    if (!header || !section) return;

    let headerVisible = true;
    let sectionVisible = true;

    const update = () => setShowFloatingLabel(!headerVisible && sectionVisible);

    const headerObs = new IntersectionObserver(
      ([e]) => { headerVisible = e.isIntersecting; update(); },
      { threshold: 0 },
    );
    const sectionObs = new IntersectionObserver(
      ([e]) => { sectionVisible = e.isIntersecting; update(); },
      { threshold: 0 },
    );

    headerObs.observe(header);
    sectionObs.observe(section);
    return () => { headerObs.disconnect(); sectionObs.disconnect(); };
  }, []);

  // Scroll-based category cycling with pin + scrub (speed-normalized)
  useEffect(() => {
    const el = sectionTriggerRef.current;
    const content = contentRef.current;
    if (!el || !content) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(content, { opacity: 1 });
      setShowAllFilters(true);
      return;
    }

    const cycleOrder = ['UX/UI', 'Motion', 'Branding', 'Game design', 'Graphic', 'All'];
    const DEAD_ZONE = 0.12;
    let lastCatIdx = -1;
    let maxProgress = 0;

    // Initial state: content hidden
    gsap.set(content, { opacity: 0 });

    const proxy = { p: 0 };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 5%',
        end: '+=2800',
        pin: true,
        pinSpacing: true,
        scrub: 1.5,
        onLeave: () => {
          animationDoneRef.current = true;
          isCycling.current = false;
          setShowAllFilters(true);
          setActiveCategory('All');
          tl.scrollTrigger?.kill();
          tl.kill();
          // Clear residual pin styles to restore sticky behavior
          gsap.set(el, { clearProps: 'all' });
          gsap.set(content, { opacity: 1 });
        },
      },
    });

    tl.to(proxy, {
      p: 1,
      duration: 1,
      ease: 'none',
      onUpdate: () => {
        const p = proxy.p;

        // Forward only: ignore reverse scroll
        if (p < maxProgress) {
          gsap.set(content, { opacity: 1 });
          return;
        }
        maxProgress = p;

        // Dead zone: pinned but content stays hidden
        if (p < DEAD_ZONE) {
          gsap.set(content, { opacity: 0 });
          return;
        }

        // Map progress to category index
        const adjusted = (p - DEAD_ZONE) / (1 - DEAD_ZONE);
        const catIdx = Math.min(
          Math.floor(adjusted * cycleOrder.length),
          cycleOrder.length - 1,
        );

        // Sub-progress within current category slot (0 to 1)
        const slotSize = 1 / cycleOrder.length;
        const slotProgress = (adjusted - catIdx * slotSize) / slotSize;

        // Category change
        if (catIdx !== lastCatIdx) {
          lastCatIdx = catIdx;
          if (!isCycling.current) {
            isCycling.current = true;
            setShowAllFilters(false);
          }
          setActiveCategory(cycleOrder[catIdx]);
          if (catIdx === cycleOrder.length - 1) {
            isCycling.current = false;
            setShowAllFilters(true);
          }
        }

        // Opacity per slot: fade-in → hold → fade-out (last slot: no fade-out)
        const isLast = catIdx === cycleOrder.length - 1;
        let opacity = 1;
        if (slotProgress < 0.3) {
          opacity = slotProgress / 0.3;
        } else if (slotProgress > 0.7 && !isLast) {
          opacity = 1 - (slotProgress - 0.7) / 0.3;
        }
        gsap.set(content, { opacity });
      },
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  // Manual category click (after animation completes)
  const handleCategoryClick = useCallback((cat: string) => {
    if (cat === activeCategory || isCycling.current) return;
    const content = contentRef.current;
    if (!content) {
      setActiveCategory(cat);
      return;
    }
    gsap.to(content, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setActiveCategory(cat);
        gsap.to(content, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      },
    });
  }, [activeCategory]);

  const handleCardEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const img = e.currentTarget.querySelector('[data-work-img]') as HTMLElement;
    if (img) gsap.to(img, { y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.1)', duration: 0.3, ease: 'power2.out' });
  }, []);

  const handleCardLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const img = e.currentTarget.querySelector('[data-work-img]') as HTMLElement;
    if (img) gsap.to(img, { y: 0, boxShadow: '0 0px 0px rgba(0,0,0,0)', duration: 0.25, ease: 'power2.out' });
  }, []);

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item =>
        item.category === activeCategory ||
        (activeCategory === 'Game design' && item.category === 'Game')
      );

  const totalRows = Math.ceil(filteredItems.length / 2);

  const filterButtons = (textClass: string, isVertical: boolean) =>
    categories.map((category, idx) => {
      const isSelected = activeCategory === category;
      const isHovered = hoveredCategory === category;
      const showActive = isSelected || isHovered;
      const isVisible = showAllFilters || isSelected;

      return (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          onMouseEnter={() => setHoveredCategory(category)}
          onMouseLeave={() => setHoveredCategory(null)}
          aria-pressed={isSelected}
          className={`flex items-center gap-[6px] font-normal font-sans tracking-[0.4px] leading-normal whitespace-nowrap border-none cursor-pointer transition-all duration-300 ease-in-out overflow-hidden ${showActive ? 'py-1 px-2.5 bg-[#000000ff] text-[#ffffffff]' : 'py-1 px-0 bg-transparent text-[#3b3b3bff]'} ${textClass}`}
          style={{
            opacity: isVisible ? (showActive ? 1 : 0.5) : 0,
            ...(isVertical
              ? { maxHeight: isVisible ? '60px' : 0, paddingTop: isVisible ? undefined : 0, paddingBottom: isVisible ? undefined : 0 }
              : { maxWidth: isVisible ? '200px' : 0, paddingLeft: isVisible ? undefined : 0, paddingRight: isVisible ? undefined : 0 }),
            transitionDelay: showAllFilters && !isSelected ? `${idx * 60}ms` : '0ms',
          }}
        >
          <img
            src="/images/check.svg"
            alt="selected"
            width={isVertical ? 14 : 10}
            height={isVertical ? 16 : 12}
            className="shrink-0 transition-all duration-300 ease-in-out"
            style={{
              opacity: showActive ? 1 : 0,
              width: showActive ? (isVertical ? 14 : 10) : 0,
              marginRight: showActive ? 0 : -6,
            }}
          />
          {category}
        </button>
      );
    });

  return (
    <section
      ref={sectionTriggerRef}
      id="work"
      className="w-full bg-[#ffffffff] pt-8 sm:pt-12 lg:pt-[61px] pb-8 sm:pb-12 lg:pb-[61px] px-4 sm:px-6 lg:px-10"
    >
      {/* Floating section label */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2 bg-black/80 text-white text-[13px] font-medium rounded-full backdrop-blur-sm pointer-events-none transition-all duration-300"
        style={{ opacity: showFloatingLabel ? 1 : 0, transform: `translateX(-50%) translateY(${showFloatingLabel ? 0 : -12}px)` }}
      >
        Work
      </div>

      {/* Header */}
      <div ref={headerRef} className="w-full max-w-[1440px] mx-auto mb-8 sm:mb-12 flex items-center justify-between border-b border-[#adadadff] flex-col sm:flex-row gap-3 sm:gap-0">
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

      {/* Content (opacity controlled by GSAP) */}
      <div ref={contentRef} className="w-full max-w-[1440px] mx-auto">
        {/* Mobile/Tablet filter (horizontal, on top) */}
        <div className="flex lg:hidden flex-row gap-2 overflow-x-auto pb-2 mb-6">
          {filterButtons('text-[18px] sm:text-[22px]', false)}
        </div>

        {/* Grid: 3-col on desktop (col1=cards, col2=filter sticky, col3=cards), 2-col tablet, 1-col mobile */}
        <div role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] gap-x-0 sm:gap-x-8 lg:gap-x-[50px] gap-y-6 sm:gap-y-8 lg:gap-y-10">
          {/* Desktop: center filter in grid col 2, sticky */}
          <div
            className="hidden lg:flex flex-col gap-[2px] col-start-2 sticky top-[100px] self-start pt-1"
            style={{ gridRow: `1 / ${totalRows + 1}` }}
          >
            {filterButtons('text-[32px]', true)}
          </div>

          {/* Cards: explicit grid placement on desktop, auto-flow on mobile/tablet */}
          {filteredItems.map((item, idx) => {
            const href = item.slug ? `/work/${item.slug}` : '/work';
            const gridStyle = {
              '--desk-col': idx % 2 === 0 ? '1' : '3',
              '--desk-row': `${Math.floor(idx / 2) + 1}`,
            } as React.CSSProperties;

            return (
              <Link
                key={item.title}
                href={href}
                role="listitem"
                className="flex flex-col lg:col-(--desk-col) lg:row-(--desk-row) cursor-pointer no-underline text-inherit"
                style={gridStyle}
              >
                <div
                  data-work-card
                  onMouseEnter={handleCardEnter}
                  onMouseLeave={handleCardLeave}
                  className="flex flex-col"
                >
                  <div data-work-img className="relative w-full aspect-[460/248] bg-[#e1e1e1ff] overflow-hidden">
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
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
