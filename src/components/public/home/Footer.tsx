'use client';

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
      className="w-full bg-[#ebeef4ff] border-t border-[#e5e7ebff] px-5 sm:px-10 lg:px-[55.5px]"
    >
      <div
        className="max-w-[1440px] mx-auto py-8 sm:py-12 lg:py-[81px] flex flex-col sm:flex-row justify-start sm:justify-between gap-6 sm:gap-10"
      >
        {/* Left Section - Icon & Info */}
        <div
          className="flex flex-col gap-3"
        >
          {/* Icon */}
          <div className="w-6 h-6 sm:w-[31px] sm:h-[32px] block relative">
            <img
              src={logoSrc}
              alt="logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Text */}
          <div
            className="flex flex-col gap-0"
          >
            <p
              className="font-inter font-bold text-[#434850ff] m-0 leading-[1.6] tracking-[-0.3125px] text-[14px] sm:text-[15px] lg:text-[16px]"
            >
              {title}
            </p>
            <p
              className="font-inter font-normal text-[#434850ff] m-0 leading-[1.6] tracking-[-0.3125px] text-[14px] sm:text-[15px] lg:text-[16px]"
            >
              {description}
            </p>
          </div>
        </div>

        {/* Right Section - Contact */}
        <div
          className="flex flex-col gap-2"
        >
          <p
            className="text-[16px] font-bold text-[#434850ff] font-inter m-0 leading-[1.6] tracking-[-0.3125px]"
          >
            Contact
          </p>
          <p
            className="text-[16px] font-normal text-[#434850ff] font-inter m-0 leading-[1.6] tracking-[-0.3125px]"
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

          {/* SNS Links */}
          {activeSocialLinks.length > 0 && (
            <div
              className="flex flex-col gap-2 mt-2"
            >
              <p
                className="text-[16px] font-bold text-[#434850ff] font-inter m-0 leading-[1.6] tracking-[-0.3125px]"
              >
                Follow Us
              </p>
              <div
                className="flex flex-row gap-4 flex-wrap"
              >
                {activeSocialLinks.map(([platform, link]) => {
                  const IconComponent = SOCIAL_ICON_MAP[platform];
                  return (
                    <a
                      key={platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={platform}
                      className="flex items-center justify-center text-[#434850ff] transition-colors duration-200 ease-in hover:text-[#1A46E7]"
                    >
                      <IconComponent
                        className="w-6 h-6 sm:w-[31px] sm:h-[32px]"
                        strokeWidth={1.5}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
