'use client';

import Image from 'next/image';
import { Instagram, Youtube, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface FooterData {
  title?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoImagePath?: string | null;
}

interface SocialLink {
  url: string;
  isActive: boolean;
}

interface SocialLinks {
  instagram?: SocialLink;
  youtube?: SocialLink;
  facebook?: SocialLink;
  twitter?: SocialLink;
  linkedin?: SocialLink;
}

export interface FooterProps {
  data?: FooterData;
  socialLinks?: SocialLinks;
}

const SOCIAL_ICON_MAP = {
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
} as const;

type SocialPlatform = keyof typeof SOCIAL_ICON_MAP;

export function Footer({ data, socialLinks }: FooterProps) {
  const footerRef = useScrollReveal({ y: 40, duration: 0.8 });

  const title = data?.title ?? '숙명여자대학교 미술대학 시각영상디자인학과';
  const description = data?.description ?? 'University of Sookmyung Women, Visual Media Design';
  const address = data?.address ?? '서울 특별시 용산구 청파로 47길 100 숙명여자대학교 시각영상디자인과 (미술대학 201호)';
  const phone = data?.phone ?? '+82 (0)2 710 9958';
  const email = data?.email;
  const logoSrc = data?.logoImagePath ?? '/images/icon/Group-27-3.svg';

  const activeSocialLinks = socialLinks
    ? (Object.entries(socialLinks) as [SocialPlatform, SocialLink][]).filter(
        ([, link]) => link.isActive
      )
    : [];

  return (
    <footer
      ref={footerRef}
      className="w-full bg-[#eaeef4] px-4 sm:px-10 lg:px-10"
    >
      <div
        className="max-w-[1440px] mx-auto py-10 sm:py-[60px] lg:py-[60px] flex flex-col justify-center"
      >
        {/* Logo + University Name */}
        <div className="flex flex-col gap-1">
          <div className="w-[33px] h-[33px] sm:w-[40px] sm:h-[40px] block relative">
            <Image
              src={logoSrc}
              alt="logo"
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <p
            className="font-sans font-medium text-[#4a4e55] m-0 leading-[1.45] text-[12px] sm:text-[14px] lg:text-[16px]"
          >
            {title}
            <br />
            {description}
          </p>
        </div>

        {/* Contact Section - 40px gap from above */}
        <div aria-label="연락처 정보" className="flex flex-col gap-1 mt-10">
          <p
            className="text-[12px] sm:text-[14px] lg:text-[16px] font-bold text-[#4a4e55] font-['Satoshi',sans-serif] m-0 leading-[1.45]"
          >
            Contact
          </p>
          <p
            className="text-[12px] sm:text-[14px] lg:text-[16px] font-medium text-[#4a4e55] font-sans m-0 leading-[1.45]"
          >
            {phone}
            {email && (
              <>
                <br />
                <a
                  href={`mailto:${email}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {email}
                </a>
              </>
            )}
            <br />
            {address}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
