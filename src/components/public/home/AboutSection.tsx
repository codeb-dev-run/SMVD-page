'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

interface AboutSectionProps {
  title?: string;
  content?: string;
}

export default function AboutSection({
  title = 'About SMVD',
  content = '',
}: AboutSectionProps) {
  const sectionRef = useScrollReveal({ selector: '[data-about-text]', stagger: 0.15, y: 40, start: 'top 75%' });

  return (
    <section id="about" className="w-full bg-[#ffffffff] flex flex-col">
      {/* Title Section with underline (matches Exhibition/Work headers) */}
      <div className="w-full pt-8 sm:pt-12 lg:pt-[60px] px-5 sm:px-6 lg:px-10">
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
          }}
        >
          <div className="pb-5 border-b border-[#141414ff]">
            <h2 className="text-[20px] sm:text-[24px] lg:text-[32px] font-bold text-[#141414ff] font-['Helvetica'] m-0">
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div ref={sectionRef} aria-label="About SMVD 소개" className="w-full bg-white pt-10 sm:pt-[60px] lg:pt-20 pb-10 sm:pb-[60px] lg:pb-20 px-5 sm:px-6 lg:px-10">
        <div className="max-w-[1440px] mx-auto flex items-center justify-center flex-col gap-1 sm:gap-2">
          {content ? (
            // Display content from database
            <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-normal leading-[1.6] text-[#141414ff] font-sans m-0 whitespace-pre-wrap break-keep">
              {content}
            </p>
          ) : (
            // Display default hardcoded content
            <>
              {/* Line 1: FROM VISUAL DELIVERY + icon */}
              <div data-about-text className="flex items-center justify-center gap-2 text-[18px] sm:text-[34px] lg:text-[48px] font-medium leading-[1.3] text-[#141414ff] font-['Satoshi',sans-serif] whitespace-nowrap">
                FROM VISUAL DELIVERY
                <svg
                  className="w-5 h-5 sm:w-9 sm:h-9 lg:w-[44px] lg:h-[44px] shrink-0"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M42 0C46.4183 7.08682e-07 50 3.58172 50 8V42C50 46.4183 46.4183 50 42 50H8C3.58172 50 0 46.4183 0 42V8C7.08705e-07 3.58172 3.58172 0 8 0H42ZM18.333 14H5L11.667 25L5 36H18.333L25 47L31.667 36H45L38.333 25L45 14H31.6826L25.0156 3L18.333 14Z"
                    fill="#141414ff"
                  />
                </svg>
              </div>

              {/* Line 2: icon + TO SYSTEMIC SOLUTIONS */}
              <div data-about-text className="flex items-center justify-center gap-2 text-[18px] sm:text-[34px] lg:text-[48px] font-medium leading-[1.3] text-[#141414ff] font-['Satoshi',sans-serif] whitespace-nowrap">
                <svg
                  className="w-5 h-5 sm:w-9 sm:h-9 lg:w-[44px] lg:h-[44px] shrink-0"
                  viewBox="0 0 50 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M28.0164 16C28.0164 18.2091 29.8072 20 32.0164 20C34.2255 20 36.0164 18.2091 36.0164 16C36.0164 13.7909 34.2255 12 32.0164 12C29.8072 12 28.0164 13.7909 28.0164 16ZM41.9998 16C41.9998 18.2091 43.7907 20 45.9998 20C48.209 20 49.9998 18.2091 49.9998 16C49.9998 13.7909 48.209 12 45.9998 12C43.7907 12 41.9998 13.7909 41.9998 16ZM34.9998 27.9998C34.9998 30.209 36.7906 31.9998 38.9998 31.9998C41.2089 31.9998 42.9998 30.209 42.9998 27.9998C42.9998 25.7907 41.2089 23.9998 38.9998 23.9998C36.7906 23.9998 34.9998 25.7907 34.9998 27.9998ZM42 40C42 42.2091 43.7909 44 46 44C48.2091 44 50 42.2091 50 40C50 37.7909 48.2091 36 46 36C43.7909 36 42 37.7909 42 40ZM27.9999 40C27.9999 42.2091 29.7908 44 31.9999 44C34.2091 44 35.9999 42.2091 35.9999 40C35.9999 37.7909 34.2091 36 31.9999 36C29.7908 36 27.9999 37.7909 27.9999 40ZM20.9999 52C20.9999 54.2091 22.7908 56 24.9999 56C27.209 56 28.9999 54.2091 28.9999 52C28.9999 49.7909 27.209 48 24.9999 48C22.7908 48 20.9999 49.7909 20.9999 52ZM13.9999 40C13.9999 42.2091 15.7907 44 17.9999 44C20.209 44 21.9999 42.2091 21.9999 40C21.9999 37.7909 20.209 36 17.9999 36C15.7907 36 13.9999 37.7909 13.9999 40ZM0 40C0 42.2091 1.79086 44 4 44C6.20914 44 8 42.2091 8 40C8 37.7909 6.20914 36 4 36C1.79086 36 0 37.7909 0 40ZM6.99985 28C6.99985 30.2091 8.79071 32 10.9998 32C13.209 32 14.9998 30.2091 14.9998 28C14.9998 25.7909 13.209 24 10.9998 24C8.79071 24 6.99985 25.7909 6.99985 28ZM0 16C0 18.2091 1.79086 20 4 20C6.20914 20 8 18.2091 8 16C8 13.7909 6.20914 12 4 12C1.79086 12 0 13.7909 0 16ZM13.9999 16C13.9999 18.2091 15.7907 20 17.9999 20C20.209 20 21.9999 18.2091 21.9999 16C21.9999 13.7909 20.209 12 17.9999 12C15.7907 12 13.9999 13.7909 13.9999 16ZM21.0163 4C21.0163 6.20914 22.8072 8 25.0163 8C27.2255 8 29.0163 6.20914 29.0163 4C29.0163 1.79086 27.2255 0 25.0163 0C22.8072 0 21.0163 1.79086 21.0163 4ZM32.0164 16V16.75H45.9998V16V15.25H32.0164V16ZM38.9998 27.9998L38.352 28.3777L45.3522 40.3779L46 40L46.6478 39.6221L39.6476 27.6219L38.9998 27.9998ZM31.9999 40L31.3521 39.6221L24.3521 51.6221L24.9999 52L25.6477 52.3779L32.6478 40.3779L31.9999 40ZM17.9999 40V39.25H4V40V40.75H17.9999V40ZM10.9998 28L11.6477 27.6221L4.64784 15.6221L4 16L3.35216 16.3779L10.352 28.3779L10.9998 28ZM17.9999 16L18.6473 16.3786L25.6638 4.37857L25.0163 4L24.3689 3.62143L17.3524 15.6214L17.9999 16Z"
                    fill="#141414ff"
                  />
                </svg>
                TO SYSTEMIC SOLUTIONS
              </div>

              {/* Line 3: SOLVING + icon + PROBLEMS, */}
              <div data-about-text className="flex items-center justify-center gap-2 text-[18px] sm:text-[34px] lg:text-[48px] font-medium leading-[1.3] text-[#141414ff] font-['Satoshi',sans-serif] whitespace-nowrap">
                SOLVING
                <svg
                  className="w-5 h-5 sm:w-9 sm:h-9 lg:w-[44px] lg:h-[44px] shrink-0"
                  viewBox="0 0 59 62"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M54.1556 11.9996L43.101 14.9086L46.01 25.9633L57.0646 23.0542L54.1556 11.9996ZM39.01 37.9631L50.0646 35.0541L47.1556 23.9995L36.101 26.9085L39.01 37.9631ZM58.1659 42.9814L50.083 34.8985L42.0001 42.9814L50.083 51.0644L58.1659 42.9814ZM28 42.9814L36.0829 51.0644L44.1658 42.9814L36.0829 34.8985L28 42.9814ZM33.1557 61.9633L36.0647 50.9087L25.0102 47.9996L22.1011 59.0542L33.1557 61.9633ZM18.0101 35.9996L15.1011 47.0542L26.1556 49.9633L29.0647 38.9087L18.0101 35.9996ZM4.01033 49.9633L15.0649 47.0541L12.1557 35.9996L1.10113 38.9088L4.01033 49.9633ZM19.1555 23.9996L8.10097 26.9088L11.0102 37.9633L22.0647 35.0541L19.1555 23.9996ZM0.000103951 18.9814L8.08301 27.0643L16.1659 18.9814L8.08301 10.8985L0.000103951 18.9814ZM30.1658 18.9814L22.0829 10.8985L14 18.9814L22.0829 27.0643L30.1658 18.9814ZM25.0266 -0.000387669L22.1175 11.0542L33.1721 13.9633L36.0812 2.90869L25.0266 -0.000387669ZM40.1721 25.9633L43.0812 14.9087L32.0266 11.9996L29.1175 23.0542L40.1721 25.9633ZM50.0828 18.9814L48.8735 18.276L41.8735 30.2758L43.0828 30.9813L44.2921 31.6867L51.2921 19.6869L50.0828 18.9814ZM50.083 42.9814V41.5814H36.0829V42.9814V44.3814H50.083V42.9814ZM29.0829 54.9814L30.2922 54.276L23.2922 42.276L22.0829 42.9814L20.8736 43.6869L27.8736 55.6869L29.0829 54.9814ZM8.08301 42.9814L9.2923 43.6869L16.2922 31.6869L15.0829 30.9814L13.8736 30.276L6.87371 42.276L8.08301 42.9814ZM8.08301 18.9814V20.3814H22.0829V18.9814V17.5814H8.08301V18.9814ZM29.0993 6.98145L27.89 7.68687L34.8901 19.6869L36.0994 18.9814L37.3087 18.276L30.3086 6.27602L29.0993 6.98145Z"
                    fill="#141414ff"
                  />
                </svg>
                PROBLEMS,
              </div>

              {/* Line 4: SHAPING THE FUTURE OF VISUALS */}
              <div data-about-text className="text-[18px] sm:text-[34px] lg:text-[48px] font-medium leading-[1.3] text-[#141414ff] font-['Satoshi',sans-serif] whitespace-nowrap m-0">
                SHAPING THE FUTURE OF VISUALS
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
