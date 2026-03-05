'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AboutPageIntro,
  AboutPageVision,
  AboutPageHistory,
  OurPeopleTab,
} from '@/components/public/about';

interface Professor {
  id: string;
  name: string;
  title: string;
  office?: string;
  email: string[];
  phone?: string;
  badge?: string;
  courses?: {
    undergraduate: string[];
    graduate: string[];
  };
}

interface Instructor {
  name: string;
  specialty: string;
}

interface AboutContentProps {
  introData?: {
    title?: string;
    description?: string;
    imageSrc?: string;
  };
  visionData?: {
    title?: string;
    content?: string;
    chips?: string[];
  };
  historyData?: {
    title?: string;
    introText?: string;
    timelineItems?: Array<{ year: string; description: string }>;
  };
  peopleData?: {
    professors?: Professor[];
    instructors?: Instructor[];
  };
}

function TabController({ onTabSelect }: { onTabSelect: (tab: 'major' | 'people') => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'people') {
      onTabSelect('people');
    }
  }, [searchParams, onTabSelect]);
  return null;
}

export default function AboutContent({
  introData,
  visionData,
  historyData,
  peopleData,
}: AboutContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'major' | 'people'>('major');

  return (
    <div className="w-full pt-0 pb-[61px] px-5 sm:px-10 lg:px-10 bg-[#ffffffff]">
      <Suspense fallback={null}>
        <TabController onTabSelect={setActiveTab} />
      </Suspense>
      <div className="max-w-[1440px] mx-auto flex flex-col gap-10 lg:gap-[50px]">
        {/* Tab Buttons */}
        <div className="flex gap-5 sm:gap-[30px] lg:gap-10 border-b-2 border-neutral-1450 pb-4 sm:pb-5">
          <button
            onClick={() => {
              setActiveTab('major');
              router.push('/about');
            }}
            className={`bg-transparent border-none text-[18px] sm:text-[20px] lg:text-[24px] font-satoshi cursor-pointer py-2 m-0 transition-all duration-200 ease-in ${
              activeTab === 'major' ? 'font-bold text-neutral-1450' : 'font-normal text-[#7b828eff]'
            }`}
          >
            About Major
          </button>
          <button
            onClick={() => {
              setActiveTab('people');
              router.push('/about?tab=people');
            }}
            className={`bg-transparent border-none text-[18px] sm:text-[20px] lg:text-[24px] font-satoshi cursor-pointer py-2 m-0 transition-all duration-200 ease-in ${
              activeTab === 'people' ? 'font-bold text-neutral-1450' : 'font-normal text-[#7b828eff]'
            }`}
          >
            Our People
          </button>
        </div>

        {/* About Major Tab */}
        {activeTab === 'major' && (
          <div id="sections" className="flex flex-col gap-10 lg:gap-[50px]">
            <AboutPageIntro
              title={introData?.title}
              description={introData?.description}
              imageSrc={introData?.imageSrc}
            />
            <AboutPageVision
              title={visionData?.title}
              content={visionData?.content}
              chips={visionData?.chips}
            />
            <AboutPageHistory
              title={historyData?.title}
              introText={historyData?.introText}
              timelineItems={historyData?.timelineItems}
            />
          </div>
        )}

        {/* Our People Tab */}
        {activeTab === 'people' && (
          <div id="people">
            <OurPeopleTab
              professors={peopleData?.professors}
              instructors={peopleData?.instructors}
            />
          </div>
        )}
      </div>
    </div>
  );
}
