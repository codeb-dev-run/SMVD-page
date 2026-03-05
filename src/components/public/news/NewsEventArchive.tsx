'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
interface NewsItem {
  id: string;
  category: string;
  date: string;
  title: string;
  description: string;
  image: string;
}

// Hardcoded fallback data
const defaultNewsItems: NewsItem[] = [
  {
    id: '1',
    category: 'Notice',
    date: '2025-01-05',
    title: '미술대학 2024년도 학생경비 집행내역 공개',
    description: '',
    image: '/Group-27.svg',
  },
  {
    id: '2',
    category: 'Notice',
    date: '2025-01-05',
    title: '디자인학과(박사) 2024년도 학생경비 집행내역 공개',
    description: '',
    image: '/Group-27.svg',
  },
  {
    id: '3',
    category: 'Notice',
    date: '2025-01-05',
    title: '시각영상디자인학과(석사) 2024년도 학생경비 집행내역 공개',
    description: '',
    image: '/Group-27.svg',
  },
  {
    id: '4',
    category: 'Notice',
    date: '2025-01-05',
    title: '시각영상디자인학과 2024년도 학생경비 집행내역 공개',
    description: '',
    image: '/Group-27.svg',
  },
  {
    id: '5',
    category: 'Event',
    date: '2025-01-05',
    title: '2024 시각\u00b7영상디자인과 졸업전시회',
    description: '이번 전시 주제인 "Ready, Set, Go!" KICK OFF는 들을 제기 한전을 넘어 새로운 도약을 준비하는 결심을 담고 있습니다...',
    image: '/images/news/Image-1.png',
  },
  {
    id: '6',
    category: 'Event',
    date: '2025-01-05',
    title: '2024 시각\u00b7영상디자인과 동문의 밤',
    description: '2024년 10월 28일, 백주년기념관 한상은 라운지에서 2024 시각\u00b7영상디자인과 동문의 밤 행사를 진행했습니다. 1부에는 동문 특강을, 2부에는 황순선 교수님의 서프라이즈 퇴임식을 진행했습니다...',
    image: '/images/news/Image.png',
  },
  {
    id: '7',
    category: 'Notice',
    date: '2025-01-05',
    title: '학생경비 집행 내역',
    description: '',
    image: '/Group-27.svg',
  },
  {
    id: '8',
    category: 'Notice',
    date: '2025-01-05',
    title: '[ 시각영상디자인과(박사) 2023 학생경비 집행내역 공개 ]',
    description: '',
    image: '/Group-27.svg',
  },
  {
    id: '9',
    category: 'Notice',
    date: '2025-01-05',
    title: '[ 시각영상디자인과(석사) 2023 학생경비 집행내역 공개 ]',
    description: '',
    image: '/Group-27.svg',
  },
  {
    id: '10',
    category: 'Notice',
    date: '2025-01-05',
    title: '[졸업] 재학생 졸업학점 이수완환 확인 및 과목 정리 실시',
    description: '',
    image: '/Group-27.svg',
  },
];

const categories = ['ALL', 'Notice', 'Event', 'Lecture', 'Exhibition', 'Awards', 'Recruiting'];

interface NewsEventArchiveProps {
  items?: NewsItem[] | null;
}

export default function NewsEventArchive({ items }: NewsEventArchiveProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const newsItems = items ?? defaultNewsItems;

  // Filter items based on selected category
  const displayedItems =
    selectedCategory === 'ALL'
      ? newsItems
      : newsItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Title */}
      <div className="w-full pb-4 sm:pb-5 border-b-2 border-neutral-1450">
        <h1 className="text-[18px] sm:text-[20px] lg:text-[24px] font-bold font-satoshi text-[#1b1d1f] m-0 py-2">
          News&Event
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto sm:flex-wrap sm:overflow-x-visible pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`shrink-0 font-satoshi transition-all duration-300 pb-1 whitespace-nowrap bg-transparent cursor-pointer border-none text-[12px] sm:text-[14px] lg:text-[16px] ${
              selectedCategory === category
                ? 'font-semibold text-neutral-1450'
                : 'font-normal text-[#7b828e]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 w-full">
        {displayedItems.map((item) => (
          <Link key={item.id} href={`/news/${item.id}`} prefetch={true}>
            <div
              className="flex gap-5 pb-5 border-b border-[#d6d8dc] cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            >
            {/* Thumbnail Image */}
            <div className="relative w-[120px] h-[120px] min-w-[120px] sm:w-[140px] sm:h-[140px] sm:min-w-[140px] lg:w-40 lg:h-40 lg:min-w-40 bg-[#ebecf0] rounded overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="160px"
                className="object-cover"
                quality={75}
              />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 sm:gap-5 flex-1">
              {/* Category and Date */}
              <div className="flex items-center gap-[6px] sm:gap-2 flex-wrap">
                <span className="text-[12px] sm:text-[13px] lg:text-[14px] font-medium font-satoshi text-neutral-1450 bg-[#ebecf0] px-[6px] py-[2px] sm:px-2 sm:py-1 rounded min-w-fit">
                  {item.category}
                </span>

                <span className="text-[12px] sm:text-[13px] lg:text-[14px] font-medium font-pretendard text-neutral-800 tracking-[-0.14px]">
                  {item.date}
                </span>
              </div>

              <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-bold font-pretendard text-neutral-1450 m-0 leading-[1.45] tracking-[-0.2px]">
                {item.title}
              </h3>

              {/* Description */}
              {item.description && (
                <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-medium font-pretendard text-[#7b828e] m-0 leading-[1.45] tracking-[-0.16px] overflow-hidden text-ellipsis line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
