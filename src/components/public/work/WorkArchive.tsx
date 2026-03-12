'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import WorkHeader from './WorkHeader';

interface PortfolioItem {
  id: string;
  category: string;
  title: string;
  date: string;
  image: string;
  subtitle: string;
}

interface ExhibitionItem {
  id: string;
  title: string;
  date: string;
  image: string;
  artist: string;
}



// Default hardcoded data (fallback when DB is empty)
const defaultPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    category: 'UX/UI',
    title: 'Vora',
    date: '2025',
    subtitle: '권나연 외 3명, 2025',
    image: '/images/work/portfolio-12.png',
  },
  {
    id: '2',
    category: 'UX/UI',
    title: 'Mindit',
    date: '2025',
    subtitle: '도인영 외 3명, 2025',
    image: '/images/work/portfolio-10.png',
  },
  {
    id: '3',
    category: 'Game',
    title: 'StarNew Valley',
    date: '2025',
    subtitle: '안시현 외 3명, 2025',
    image: '/images/work/portfolio-9.png',
  },
  {
    id: '4',
    category: 'UX/UI',
    title: 'Pave',
    date: '2025',
    subtitle: '박지우 외 2명, 2025',
    image: '/images/work/portfolio-11.png',
  },
  {
    id: '5',
    category: 'UX/UI',
    title: 'Bolio',
    date: '2025',
    subtitle: '박근영, 2025',
    image: '/images/work/portfolio-7.png',
  },
  {
    id: '6',
    category: 'UX/UI',
    title: 'MIST AWAY',
    date: '2025',
    subtitle: '신예지, 2025',
    image: '/images/work/portfolio-6.png',
  },
  {
    id: '7',
    category: 'Branding',
    title: 'BICHAE',
    date: '2025',
    subtitle: '최은정, 2025',
    image: '/images/work/portfolio-5.png',
  },
  {
    id: '8',
    category: 'UX/UI',
    title: 'Morae',
    date: '2023',
    subtitle: '고은서, 2023',
    image: '/images/work/portfolio-4.png',
  },
  {
    id: '9',
    category: 'Branding',
    title: 'STUDIO KNOT',
    date: '2025',
    subtitle: '노하린, 2025',
    image: '/images/work/portfolio-3.png',
  },
  {
    id: '10',
    category: 'Branding',
    title: 'BLOME',
    date: '2025',
    subtitle: '김진아 외 1명, 2025',
    image: '/images/work/portfolio-8.png',
  },
  {
    id: '11',
    category: 'Motion',
    title: 'alors: romanticize your life, every...',
    date: '2025',
    subtitle: '정유진, 2025',
    image: '/images/work/portfolio-2.png',
  },
  {
    id: '12',
    category: 'Motion',
    title: '고군분투',
    date: '2025',
    subtitle: '한다인, 2025',
    image: '/images/work/portfolio-1.png',
  },
];

const defaultExhibitionItems: ExhibitionItem[] = [
  {
    id: '1',
    title: 'Vora',
    date: '권나연 외 3명, 2025',
    image: '/images/exhibition/Rectangle 45-5.png',
    artist: 'Voice Out Recovery Assistant',
  },
  {
    id: '2',
    title: 'Mindit',
    date: '도인영 외 3명, 2025',
    image: '/images/exhibition/Rectangle 45-4.png',
    artist: '도민앱 외 3명',
  },
  {
    id: '3',
    title: 'MIST AWAY',
    date: '신예지, 2025',
    image: '/images/exhibition/Rectangle 45-3.png',
    artist: '신예지',
  },
  {
    id: '4',
    title: 'GALJIDO (갈지도)',
    date: '조혜원, 2025',
    image: '/images/exhibition/Rectangle 45-2.png',
    artist: '조혜원',
  },
  {
    id: '5',
    title: 'Callmate',
    date: '고은빈, 2025',
    image: '/images/exhibition/Rectangle 45-1.png',
    artist: '고은빈',
  },
  {
    id: '6',
    title: 'MOA',
    date: '강세정 외 2명, 2025',
    image: '/images/exhibition/Rectangle 45.png',
    artist: '강세정',
  },
];

const ITEMS_PER_PAGE = 12;

interface WorkArchiveProps {
  portfolioItemsFromDB?: PortfolioItem[];
  exhibitionItemsFromDB?: ExhibitionItem[];
}

function WorkTabController({ onTabSelect }: { onTabSelect: (tab: 'achieve' | 'exhibition') => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'achieve' || tabParam === 'exhibition') {
      onTabSelect(tabParam);
    }
  }, [searchParams, onTabSelect]);
  return null;
}

export default function WorkArchive({
  portfolioItemsFromDB,
  exhibitionItemsFromDB,
}: WorkArchiveProps = {}) {
  const portfolioItems = portfolioItemsFromDB ?? defaultPortfolioItems;
  const exhibitionItems = exhibitionItemsFromDB ?? defaultExhibitionItems;

  const [activeTab, setActiveTab] = useState<'achieve' | 'exhibition'>('achieve');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dynamic categories from actual data
  const dynamicCategories = ['All', ...Array.from(new Set(portfolioItems.map((item) => item.category)))];

  // Filter items based on selected category
  const filteredItems =
    selectedCategory === 'All'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === selectedCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedItems = filteredItems.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-4 w-full px-4 sm:px-6 lg:px-0">
      {/* Page Title */}
      <div className="w-full pb-4 sm:pb-5 border-b-2 border-neutral-1450">
        <h1 className="text-[18px] sm:text-[20px] lg:text-[24px] font-bold font-satoshi text-[#1b1d1f] m-0 py-2">
          {activeTab === 'achieve' ? 'Achieve' : 'Exhibition'}
        </h1>
      </div>
      <Suspense fallback={null}>
        <WorkTabController onTabSelect={setActiveTab} />
      </Suspense>
      {/* Archive Section Header - Only show for Achieve tab */}
      {activeTab === 'achieve' && (
        <WorkHeader
          currentCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={dynamicCategories}
        />
      )}

      {/* Achieve Tab Grid */}
      {activeTab === 'achieve' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
          {displayedItems.map((item) => (
            <Link key={item.id} href={`/work/${item.id}`} prefetch={true}>
              <div className="flex flex-col gap-[10px] cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-1">
                {/* Portfolio Item Image */}
                <div className="relative w-full aspect-4/3 bg-[#f0f0f0] rounded overflow-hidden flex items-center justify-center">
                  {item.image === '/Group-27.svg' ? (
                    <img
                      src="/Group-27.svg"
                      alt={item.title}
                      className="w-14 h-14 opacity-40"
                    />
                  ) : (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      style={{ objectFit: 'cover' }}
                      quality={75}
                    />
                  )}
                </div>

                {/* Portfolio Item Info */}
                <div className="flex flex-col gap-1">
                  {/* Category Badge */}
                  <span className="text-[11px] sm:text-[12px] font-medium text-[#7b828e] font-satoshi">
                    {item.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-[12px] sm:text-[13px] lg:text-[14px] font-semibold text-neutral-1450 font-pretendard m-0 leading-[1.4]">
                    {item.title}
                  </h3>

                  {/* Subtitle */}
                  <span className="text-[11px] lg:text-[12px] font-normal text-black font-satoshi">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Exhibition Tab Grid */}
      {activeTab === 'exhibition' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 w-full pt-4 sm:pt-5">
          {exhibitionItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-1"
            >
              {/* Exhibition Item Image */}
              <div className="relative w-full aspect-3/4 bg-[#f0f0f0] rounded overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }}
                  quality={75}
                />
              </div>

              {/* Exhibition Item Info */}
              <div className="flex flex-col gap-1">
                {/* Title */}
                <h3 className="text-[14px] sm:text-[15px] lg:text-[16px] font-semibold text-neutral-1450 font-pretendard m-0 leading-[1.4]">
                  {item.title}
                </h3>

                {/* Date/Artist */}
                <span className="text-[12px] sm:text-[13px] lg:text-[14px] font-normal text-black font-satoshi">
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination - Only show for Achieve tab */}
      {activeTab === 'achieve' && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 w-full mt-8 sm:mt-9 lg:mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`text-[12px] sm:text-[14px] font-satoshi border-none cursor-pointer rounded transition-all duration-300 ease-in-out px-[10px] py-[6px] sm:px-3 sm:py-2 ${
                currentPage === page
                  ? 'font-semibold text-neutral-1450 bg-[#f0f0f0]'
                  : 'font-medium text-[#7b828e] bg-transparent'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
