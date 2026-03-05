'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { gsap } from '@/lib/gsap';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  parentId: string | null;
}

interface HeaderConfig {
  logoImagePath?: string | null;
  faviconImagePath?: string | null;
}

interface HeaderProps {
  navigation?: NavigationItem[];
  headerConfig?: HeaderConfig;
  animateOnMount?: boolean;
}

interface NavItemConfig {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

// 기본 메뉴 (CMS 연동 없을 때)
const DEFAULT_NAV_ITEMS: NavItemConfig[] = [
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'About Major', href: '/about' },
      { label: 'Our People', href: '/about?tab=people' },
    ],
  },
  { label: 'Curriculum', href: '/curriculum' },
  {
    label: 'Work',
    href: '/work',
    children: [
      { label: 'Achieve', href: '/work' },
      { label: 'Exhibition', href: '/work?tab=exhibition' },
    ],
  },
  { label: 'News&Event', href: '/news' },
];

export function Header({ navigation, headerConfig, animateOnMount = true }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = headerRef.current;
    if (!el) return;

    // Set initial hidden state
    gsap.set(el, { y: -20, opacity: 0 });

    // Don't animate until loading screen is done
    if (!animateOnMount) return;

    const tween = gsap.to(el, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1, clearProps: 'transform' });
    return () => { tween.kill(); };
  }, [animateOnMount]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // CMS navigation에 기본 드롭다운 children 병합
  const defaultChildrenMap = new Map(
    DEFAULT_NAV_ITEMS.filter(i => i.children).map(i => [i.label, i.children]),
  );
  const navItems: NavItemConfig[] = navigation && navigation.length > 0
    ? navigation.map(item => ({
        label: item.label,
        href: item.href,
        children: defaultChildrenMap.get(item.label),
      }))
    : DEFAULT_NAV_ITEMS;

  return (
    <header
      ref={headerRef}
      className="w-full h-[64px] sm:h-[72px] lg:h-[80px] bg-[#ffffffff] flex items-center px-5 sm:px-10 lg:px-10"
    >
      {/* Logo */}
      <Link
        href="/"
        className="w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] mr-auto flex items-center justify-center relative no-underline border-none outline-none"
      >
        {headerConfig?.logoImagePath ? (
          <Image
            src={headerConfig.logoImagePath}
            alt="Logo"
            width={42}
            height={42}
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <svg
            width="39"
            height="40"
            viewBox="0 0 39 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.3626 35.82L19.3658 35.8137L19.3626 35.8105L19.3594 35.82H19.3626Z" fill="#4A4E55"/>
            <path d="M20.288 37.3884L20.2529 37.3291C20.2529 37.3291 20.272 37.3617 20.288 37.3884Z" fill="#4A4E55"/>
            <path d="M20.2529 37.3262L20.288 37.3855C20.288 37.3855 20.2879 37.3915 20.2911 37.3944H20.2943C20.2784 37.3707 20.2657 37.3499 20.2529 37.3262Z" fill="#4A4E55"/>
            <path d="M19.3657 35.8199L19.3625 35.8135L19.3594 35.8199H19.3657Z" fill="#4A4E55"/>
            <path d="M35.4385 9.96962C35.4385 9.96962 35.4544 9.94588 35.4671 9.92511C35.4703 9.91917 35.4767 9.91027 35.483 9.90137C35.4703 9.92214 35.4544 9.94291 35.4417 9.96665L35.4385 9.96962Z" fill="#4A4E55"/>
            <path d="M6.30812 12.5254H6.30176L6.33041 12.5634H6.33359L6.30812 12.5254Z" fill="#4A4E55"/>
            <path d="M6.33041 12.5634L6.30494 12.5254H6.30176L6.32722 12.5634H6.33041Z" fill="#4A4E55"/>
            <path d="M15.6079 12.5155L21.2978 3.16634H21.2947C21.4963 2.85529 21.616 2.49435 21.616 2.107C21.6286 0.956694 20.6299 0.00886534 19.3917 6.19725e-05C18.1535 -0.00874139 17.1391 0.921482 17.1296 2.07472C17.1265 2.46207 17.2399 2.82594 17.4352 3.13993L18.4623 4.95049L19.1428 3.83246L18.4749 2.66455C18.4528 2.6176 18.2922 2.39458 18.2827 2.08353C18.267 1.52304 18.7805 1.07114 19.3823 1.07701C19.984 1.08288 20.4692 1.54065 20.4629 2.10113C20.4629 2.28894 20.403 2.46207 20.3054 2.61173C20.2928 2.63227 14.8927 11.4474 14.8927 11.4474L5.98926 11.4562L6.69183 12.5302L15.6047 12.5214L15.6079 12.5155Z" fill="#4A4E55"/>
            <path d="M19.5605 6.72831L23.149 12.5092L32.0147 12.5004L32.2573 12.1365L32.7299 11.4234L23.8138 11.4322L20.2253 5.6543L19.5605 6.72831Z" fill="#4A4E55"/>
            <path d="M19.1975 33.2839L15.5807 27.4678L6.67088 27.4736L5.98721 28.533L5.97461 28.5506L14.9159 28.5418L18.5296 34.3579L19.1975 33.2839Z" fill="#4A4E55"/>
            <path d="M6.31682 12.5611L4.25006 9.3919C4.05788 9.07791 3.78063 8.80207 3.41832 8.61133C2.34398 8.03618 0.970335 8.38538 0.355976 9.3831C-0.258382 10.3837 0.11338 11.6632 1.18457 12.2354C1.54688 12.4291 1.9407 12.5142 2.32822 12.5112L4.54936 12.5406L3.84049 11.4578L2.38493 11.4343C2.36288 11.4343 2.33767 11.4343 2.31247 11.4343C2.12343 11.4343 1.9344 11.3961 1.76112 11.3022C1.23813 11.0235 1.05855 10.4014 1.35785 9.91717C1.65715 9.43005 2.33452 9.24518 2.84491 9.54156C3.12846 9.70589 3.25449 9.94651 3.28599 9.98759L5.49138 13.374L9.60285 19.9912L4.21855 28.5216H4.21225C4.21225 28.5216 4.21225 28.5246 4.21225 28.5275L3.20723 29.9918C3.19778 30.0123 3.18202 30.0299 3.16942 30.0475C3.07175 30.1972 2.93628 30.3263 2.75985 30.4173C2.23055 30.6843 1.56894 30.4994 1.28224 30.0094C0.99554 29.5164 1.18457 28.8826 1.72332 28.6331C1.94701 28.5304 2.16439 28.5187 2.28097 28.5187H2.29672C2.32822 28.5187 2.35343 28.5187 2.36288 28.5187L3.76803 28.5275L4.46745 27.4593L2.32822 27.4388C1.9407 27.4241 1.54058 27.5034 1.17512 27.6882C0.0850259 28.237 -0.318244 29.5076 0.27091 30.52C0.860064 31.5324 2.22425 31.9109 3.31119 31.3651C3.67666 31.1802 3.96336 30.9132 4.16185 30.6021H4.165L5.56699 28.551L10.9324 19.9912L6.31682 12.5611Z" fill="#4A4E55"/>
            <path d="M32.2035 27.7045L32.0333 27.4521L23.1488 27.461L17.4211 36.8483H17.4274C17.2289 37.1623 17.1123 37.5232 17.1123 37.9105C17.1123 39.0638 18.1205 39.9999 19.3555 39.9999C20.5905 39.9999 21.5987 39.0609 21.5987 37.9105C21.5987 37.5232 21.4821 37.1593 21.2836 36.8483L20.2251 35.0553L19.5571 36.1499L20.244 37.3295C20.2597 37.3501 20.2723 37.3735 20.2849 37.397H20.2818C20.3385 37.4939 20.4298 37.6758 20.4393 37.9105C20.4614 38.471 19.951 38.9259 19.3492 38.9259C18.7474 38.9259 18.2591 38.471 18.2591 37.9105C18.2591 37.7227 18.3158 37.5496 18.4135 37.397C18.4261 37.3794 18.4355 37.3589 18.4481 37.3383L19.3461 35.8183L23.8104 28.532L32.758 28.5232L32.717 28.4645L32.2003 27.7045H32.2035Z" fill="#4A4E55"/>
            <path d="M37.5463 27.6585C37.1809 27.4707 36.7839 27.3915 36.3964 27.4032H36.4499H34.2193L34.8936 28.4772H36.3523C36.409 28.486 36.6925 28.4596 36.9918 28.6005C37.5306 28.8528 37.7102 29.4896 37.4235 29.9797C37.1336 30.4697 36.4688 30.6487 35.9427 30.3787C35.7663 30.2878 35.6308 30.1557 35.5363 30.0061C35.5237 29.9885 35.5111 29.9709 35.4985 29.9503L34.5249 28.5154L29.1186 19.979L33.5546 12.8512L35.4418 9.97254C35.4544 9.94907 35.4701 9.92853 35.4827 9.90505C35.5457 9.81408 35.6686 9.64682 35.8828 9.52357C36.3932 9.23013 37.0706 9.415 37.3699 9.89918C37.6692 10.3834 37.4865 11.0055 36.9666 11.2842C36.7933 11.3781 36.6012 11.4163 36.4121 11.4134C36.3869 11.4134 36.3649 11.4134 36.3428 11.4134H36.3775C36.1506 11.4134 34.8715 11.4368 34.8715 11.4368L34.1658 12.5196L36.3964 12.4932C36.7839 12.4932 37.1809 12.4081 37.54 12.2174C38.6112 11.6452 38.9861 10.3658 38.3718 9.36511C37.7574 8.36739 36.3806 8.02113 35.3094 8.59041C34.9471 8.78409 34.6699 9.05699 34.4777 9.37391L31.1129 14.6119L27.7891 19.979L32.329 27.2829L32.537 27.591L32.5212 27.5705L34.5376 30.5548H34.5407C34.7392 30.8629 35.0227 31.1329 35.3882 31.3178C36.472 31.8724 37.8393 31.5056 38.4348 30.4932C39.0302 29.4837 38.6333 28.2102 37.5495 27.6556L37.5463 27.6585Z" fill="#4A4E55"/>
            <path d="M15.8888 18.4679C15.3627 18.4679 14.9815 18.2008 14.72 17.6521L14.6696 17.5494L13.6299 17.8223L13.6834 17.9543C13.8882 18.462 14.1875 18.8494 14.5719 19.1047C14.9594 19.3629 15.4099 19.492 15.9109 19.492C16.4118 19.492 16.8844 19.3247 17.253 18.9902C17.6216 18.6557 17.8107 18.2478 17.8107 17.7724C17.8107 17.5699 17.776 17.3763 17.7067 17.1943C17.6374 17.0124 17.5334 16.8363 17.3916 16.6749C17.253 16.5135 17.0734 16.3639 16.8592 16.2318C16.6513 16.1027 16.3551 15.9619 15.9865 15.8122C15.6368 15.6713 15.3879 15.5422 15.2493 15.4307C15.1295 15.3339 15.0697 15.2253 15.0697 15.105C15.0697 14.9612 15.1327 14.8497 15.2713 14.7587C15.4194 14.659 15.621 14.6091 15.8668 14.6091C16.0936 14.6091 16.2669 14.6413 16.3772 14.7059C16.5032 14.7793 16.645 14.8937 16.8025 15.0463L16.8907 15.1314L17.7256 14.5064L17.6405 14.4037C17.4137 14.1308 17.1301 13.9283 16.7899 13.7933C16.4559 13.6612 16.122 13.5967 15.7943 13.5967C15.2934 13.5967 14.8649 13.7434 14.512 14.031C14.156 14.3215 13.9733 14.6824 13.9733 15.0962C13.9733 15.2693 14.0048 15.4337 14.071 15.5862C14.134 15.7359 14.2348 15.8885 14.3703 16.0381C14.5057 16.1878 14.6664 16.3169 14.8491 16.4255C15.0256 16.5311 15.2808 16.6456 15.6053 16.7688C15.9109 16.8862 16.1377 16.9889 16.2732 17.0769C16.4024 17.1591 16.5126 17.2677 16.6009 17.3968C16.6828 17.52 16.7269 17.6404 16.7269 17.7607C16.7269 17.9632 16.6513 18.1275 16.4937 18.2595C16.3331 18.3945 16.1314 18.462 15.8825 18.462L15.8888 18.4679Z" fill="#4A4E55"/>
            <path d="M23.1318 16.2226L23.995 19.3126H25.0442L23.3397 13.2676L21.5439 17.279L19.7386 13.2705L18.0342 19.3126H19.0802L19.9529 16.1932L21.5471 19.7234L23.1318 16.2226Z" fill="#4A4E55"/>
            <path d="M16.4016 24.5028L14.7097 20.9463H13.585L16.389 26.8563L19.2402 20.9463H18.106L16.4016 24.5028Z" fill="#4A4E55"/>
            <path d="M21.4805 20.9385H19.9619V26.4875H21.4868C22.5706 26.4875 23.4118 26.2029 23.9852 25.6453C24.5586 25.0878 24.8484 24.4393 24.8484 23.7115C24.8484 22.9838 24.568 22.3441 24.0135 21.7836C23.4559 21.2202 22.6021 20.9355 21.4773 20.9355L21.4805 20.9385ZM21.0205 21.9039H21.2725C21.8333 21.9039 22.2839 21.9597 22.6084 22.0653C22.9203 22.168 23.1975 22.3764 23.4244 22.6815C23.6544 22.9867 23.7678 23.333 23.7678 23.7115C23.7678 24.0109 23.6953 24.2896 23.5535 24.5391C23.4118 24.7885 23.2164 24.991 22.9738 25.1406C22.7281 25.2932 22.4698 25.393 22.1988 25.437C21.9342 25.481 21.5372 25.5045 21.0174 25.5074V21.901L21.0205 21.9039Z" fill="#4A4E55"/>
          </svg>
        )}
      </Link>

      {/* Desktop Navigation (Hidden on Mobile/Tablet) */}
      <nav
        aria-label="메인 내비게이션"
        className="hidden lg:flex items-center gap-[18px] h-[38px]"
      >
          {navItems.map((item) => (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  height: '38px',
                  padding: '0 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'Helvetica',
                  textDecoration: 'none',
                  border: '1px solid #141414ff',
                  backgroundColor: isActive(item.href) ? '#141414ff' : '#ffffffff',
                  color: isActive(item.href) ? '#ffffffff' : '#141414ff',
                  borderRadius: '0px',
                }}
              >
                {item.label}
                {item.children && (
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </Link>
              {item.children && openDropdown === item.label && (
                <div
                  className="absolute top-full left-0 mt-0 min-w-[160px] bg-white border border-[#141414] z-50"
                  style={{ fontFamily: 'Helvetica' }}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-2.5 text-[13px] text-[#141414] hover:bg-[#141414] hover:text-white transition-colors no-underline"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

      {/* Mobile/Tablet Hamburger Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden bg-transparent border-none cursor-pointer p-2 flex items-center justify-center text-[#141414]"
        aria-label="Open Mobile Menu"
      >
        <Menu size={28} />
      </button>

      {/* Mobile/Tablet Fullscreen Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 w-screen h-screen bg-[#ffffffff] z-[9999] flex flex-col"
        >
          {/* Overlay Header */}
          <div
            className="w-full h-[64px] sm:h-[72px] flex items-center justify-end px-5 sm:px-10 border-b border-[#e5e7eb]"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-transparent border-none cursor-pointer p-2 flex items-center justify-center text-[#141414]"
              aria-label="Close Mobile Menu"
            >
              <X size={28} />
            </button>
          </div>

          {/* Overlay Navigation Links */}
          <nav
            aria-label="모바일 내비게이션"
            className="flex flex-col p-5 sm:p-10 gap-6"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '48px',
                  padding: '0 20px',
                  fontSize: '18px',
                  fontWeight: '500',
                  fontFamily: 'Helvetica',
                  textDecoration: 'none',
                  border: '1px solid #141414ff',
                  backgroundColor: isActive(item.href) ? '#141414ff' : '#ffffffff',
                  color: isActive(item.href) ? '#ffffffff' : '#141414ff',
                  borderRadius: '0px',
                  width: 'fit-content',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
