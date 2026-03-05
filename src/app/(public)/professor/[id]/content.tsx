import { Header, Footer } from '@/components/public/home';
import type { Professor } from '@/components/public/people/types';
import ProfessorHeader from '@/components/public/people/ProfessorHeader';
import ProfessorInfo from '@/components/public/people/ProfessorInfo';
import ProfessorCourses from '@/components/public/people/ProfessorCourses';
import ProfessorBiography from '@/components/public/people/ProfessorBiography';

interface ProfessorDetailContentProps {
  professor: Professor;
}

export default function ProfessorDetailContent({ professor }: ProfessorDetailContentProps) {
  return (
    <div>
      <Header />

      {/* Main Content */}
      <div
        className="w-full pt-0 pb-[60px] sm:pb-[100px] px-4 sm:px-10 lg:px-10 bg-[#ffffffff]"
      >
        <div
          className="max-w-[1440px] mx-auto flex flex-col sm:flex-row gap-[40px] lg:gap-[80px] items-start w-full"
        >
          {/* Left Panel - Professor Image & Badge */}
          <ProfessorHeader professor={professor} />

          {/* Right Panel - Details */}
          <div
            className="flex flex-col gap-[20px] sm:gap-[30px] flex-1 pt-0 sm:pt-[100px] w-full sm:w-auto"
          >
            <ProfessorInfo professor={professor} />
            <ProfessorCourses courses={professor.courses} />
            <ProfessorBiography biography={professor.biography} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
