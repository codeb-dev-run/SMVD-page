'use client';

import Image from 'next/image';
import Link from 'next/link';

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
  profileImage?: string;
}

interface Instructor {
  name: string;
  specialty: string;
}

interface OurPeopleTabProps {
  professors?: Professor[];
  instructors?: Instructor[];
}

const defaultProfessors: Professor[] = [
  {
    id: 'yun',
    name: '윤여종',
    title: '정교수',
    email: ['yyj@sookmyung.ac.kr'],
    phone: '+82-2-710-9682',
    badge: 'Research & Mentoring',
    courses: {
      undergraduate: ['브랜드디자인'],
      graduate: ['졸업프로젝트스튜디오 I/II'],
    },
    profileImage: '/images/people/yun-yeojong.png',
  },
  {
    id: 'kim',
    name: '김기영',
    title: '정교수',
    email: ['kiyoungkim@sookmyung.ac.kr'],
    phone: '+82-2-710-9683',
    badge: 'Vision & Marketing',
    courses: {
      undergraduate: ['마케팅디자인'],
      graduate: ['졸업프로젝트스튜디오 I/II'],
    },
    profileImage: '/images/people/kim-kiyoung.png',
  },
  {
    id: 'lee',
    name: '이지선',
    title: '정교수',
    email: ['jisun.lee@sookmyung.ac.kr'],
    phone: '+82-2-710-9684',
    badge: 'User Experience',
    courses: {
      undergraduate: ['사용자경험디자인'],
      graduate: ['졸업프로젝트스튜디오 I/II'],
    },
    profileImage: '/images/people/lee-jisun.png',
  },
  {
    id: 'na',
    name: '나유미',
    title: '정교수',
    email: ['youmi.na@sookmyung.ac.kr'],
    phone: '+82-2-710-9685',
    badge: 'User Experience',
    courses: {
      undergraduate: ['사용자경험디자인'],
      graduate: ['졸업프로젝트스튜디오 I/II'],
    },
    profileImage: '/images/people/na-youmi.png',
  },
];

const defaultInstructors: Instructor[] = [
  { name: '김아영', specialty: '기초그래픽디자인I' },
  { name: '신지영', specialty: '일러스트레이션과스토리텔링디자인 I/II' },
  { name: '최한솔', specialty: '기초그래픽디자인 I/II, 일러스트레이션과스토리텔링디자인 I/II' },
  { name: '전혜원', specialty: '일러스트레이션과스토리텔링디자인 I/II' },
  { name: '정승희', specialty: '일러스트레이션과스토리텔링디자인 I/II' },
  { name: '허주연', specialty: '기초그래픽디자인 I/II' },
  { name: '김태룡', specialty: '타이포그래피디자인 I/II' },
  { name: '권혁준', specialty: '브랜드디자인 I/II' },
  { name: '김연지', specialty: '사용자경험디자인 I/II' },
  { name: '이주형', specialty: '사용자경험디자인 I/II' },
  { name: '김도운', specialty: '사용자경험디자인 I/II' },
  { name: '장다윤', specialty: '모션디자인 I/II' },
];

export default function OurPeopleTab({
  professors = defaultProfessors,
  instructors = defaultInstructors,
}: OurPeopleTabProps) {
  return (
    <div className="flex flex-col gap-[30px] sm:gap-10 lg:gap-[60px] w-full">
      {/* Professor Section */}
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-[10px] items-start w-full pb-[30px] sm:pb-10 lg:pb-[60px] border-b border-black">
        <h2 className="text-[28px] sm:text-[36px] lg:text-[48px] font-normal text-black font-helvetica m-0 tracking-[-0.48px] w-full sm:w-[150px] lg:w-[333px] shrink sm:shrink-0">
          Professor
        </h2>

        {/* Professor List - Fluid Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-3 lg:gap-5 flex-1 w-full max-w-[1060px]">
          {professors.map((prof) => (
            <Link
              key={prof.id}
              href={`/professor/${prof.id}`}
              prefetch={true}
              className="cursor-pointer flex flex-col gap-0 w-full transition-all duration-200 hover:-translate-y-1 hover:opacity-80 no-underline"
            >
              <div className="cursor-pointer relative w-full h-auto aspect-236/356 bg-white rounded-none border-none">
                {prof.profileImage ? (
                  <Image
                    src={prof.profileImage}
                    alt={prof.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain"
                    priority={false}
                    quality={80}
                  />
                ) : (
                  <div className="w-full h-full bg-[#e5e5e5] flex items-center justify-center text-[#999]">
                    No Image
                  </div>
                )}
              </div>

              {/* Info Container */}
              <div className="flex flex-col gap-0 bg-white px-2 py-4 sm:px-3 sm:py-5 lg:px-[30px] lg:pt-[37px] lg:pb-6 w-full box-border">
                <h3 className="text-[16px] sm:text-[18px] font-normal text-black font-helvetica m-0 tracking-[-0.18px] leading-relaxed">
                  {prof.name}
                </h3>
                {prof.courses && (
                  <p className="text-[14px] sm:text-[18px] font-normal text-[#353030] font-helvetica mt-3 sm:mt-5 mb-0 leading-[1.4] whitespace-pre-wrap wrap-break-word">
                    {prof.courses.undergraduate?.join('\n') ||
                      prof.courses.graduate?.join('\n') ||
                      ''}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Instructor Section */}
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-[10px] items-start w-full pb-[30px] sm:pb-10 lg:pb-[60px]">
        <h2 className="text-[28px] sm:text-[36px] lg:text-[48px] font-normal text-black font-helvetica m-0 tracking-[-0.48px] w-full sm:w-[150px] lg:w-[333px] shrink sm:shrink-0">
          Instructor
        </h2>

        {/* Instructor List - 1 column */}
        <div className="flex flex-col flex-1 w-full sm:w-auto">
          {instructors.map((instructor, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-2 sm:gap-6 lg:gap-10 items-start sm:items-center py-3 sm:py-7 lg:py-[34px] border-b border-[#e5e5e5] bg-white min-h-auto sm:min-h-[95px] box-border"
            >
              <h3 className="text-[15px] sm:text-[18px] font-medium sm:font-normal text-[#353030] font-helvetica m-0 w-auto sm:w-[200px] lg:w-[332px] shrink sm:shrink-0">
                {instructor.name}
              </h3>
              <p className="text-[14px] sm:text-[18px] font-normal text-[#666] sm:text-[#353030] font-helvetica m-0 leading-[1.4]">
                {instructor.specialty}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
