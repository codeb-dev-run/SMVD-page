import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Professor } from '@/components/public/people/types';
import ProfessorDetailContent from './content';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = await prisma.people.findUnique({
    where: { id },
    select: { name: true, title: true, badge: true },
  });

  if (!person) {
    return { title: '교수 소개' };
  }

  const title = person.name;
  const description = `${person.name} ${person.badge ?? person.title ?? ''}. 숙명여자대학교 시각영상디자인과 교수진 소개.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | 숙명여자대학교 시각영상디자인과`,
      description,
      url: `https://smvd.sookmyung.ac.kr/professor/${id}`,
    },
    twitter: {
      card: 'summary',
      title: `${title} | 숙명여자대학교 시각영상디자인과`,
      description,
    },
  };
}

export async function generateStaticParams() {
  const professors = await prisma.people.findMany({
    select: { id: true },
    where: { archivedAt: null, role: { not: 'instructor' } },
  });
  
  return professors.map((prof) => ({
    id: prof.id,
  }));
}

export default async function ProfessorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const person = await prisma.people.findUnique({
    where: { id },
  });

  if (!person || person.archivedAt) {
    notFound();
  }

  const courses = (person.courses as Professor['courses']) ?? {
    undergraduate: [],
    graduate: [],
  };

  const biography = (person.biography as Professor['biography']) ?? {
    cvText: '',
    position: '',
    education: [],
    experience: [],
  };

  const professor: Professor = {
    id: person.id,
    name: person.name,
    badge: person.badge ?? '',
    office: person.office ?? '',
    email: person.email,
    phone: person.phone ?? '',
    homepage: person.homepage ?? undefined,
    courses,
    biography,
    profileImage: person.profileImage ?? '/images/people/default.png',
  };

  return <ProfessorDetailContent professor={professor} />;
}
