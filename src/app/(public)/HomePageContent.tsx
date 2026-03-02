'use client';

import {
  Header,
  VideoHero,
  ExhibitionSection,
  AboutSection,
  WorkSection,
  Footer,
} from '@/components/public/home';
import type { FooterProps } from '@/components/public/home/Footer';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  parentId: string | null;
}

interface HeaderConfigData {
  logoImagePath?: string | null;
  faviconImagePath?: string | null;
}

interface HomePageContentProps {
  exhibitionItems: Array<{
    year: string;
    src: string;
    alt: string;
    title?: string;
  }>;
  workItems: Array<{
    src: string;
    alt: string;
    title: string;
    category: string;
    slug?: string | null;
  }>;
  aboutContent: string;
  navigation?: NavigationItem[];
  headerConfig?: HeaderConfigData;
  footerData?: FooterProps['data'];
  socialLinks?: FooterProps['socialLinks'];
}

export default function HomePageContent({
  exhibitionItems,
  workItems,
  aboutContent,
  navigation,
  headerConfig,
  footerData,
  socialLinks,
}: HomePageContentProps) {
  return (
    <div>
      {/* Header (Figma: opacity 0.7 navigation) */}
      <Header navigation={navigation} headerConfig={headerConfig} />

      {/* Video Hero */}
      <VideoHero />

      {/* Exhibition + About with Circle Video Background (Figma: Glass Circle 1513px) */}
      <div className="relative overflow-x-clip">
        {/* Exhibition Section */}
        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[55.5px]">
          <ExhibitionSection items={exhibitionItems} />
        </div>

        {/* About Section (Full Width) */}
        <AboutSection content={aboutContent} />

        {/* Circle Video overlay (Figma: 1513px, mix-blend-mode multiply = white becomes transparent) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[60%] sm:top-[30%] w-[90vw] sm:w-screen lg:w-[1513px] aspect-square rounded-full overflow-hidden pointer-events-none"
          style={{ zIndex: 10, mixBlendMode: 'multiply' }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src="/videos/hero-default.webm" type="video/webm" />
            <source src="/videos/hero-default.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Work Section (Full Width) */}
      <WorkSection items={workItems} />

      {/* Footer */}
      <Footer data={footerData} socialLinks={socialLinks} />
    </div>
  );
}
