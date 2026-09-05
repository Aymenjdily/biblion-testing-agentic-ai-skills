import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug, getLessonBySlug, getLessonSlugs } from "@/sanity/lib/queries";
import { flattenLessons } from "@/lib/mock-progress";
import { toPlainText } from "@/lib/plain-text";
import { urlFor } from "@/sanity/lib/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LessonProgressProvider } from "@/components/lesson/LessonProgressContext";
import { LessonHero } from "@/components/lesson/LessonHero";
import { VideoEmbed } from "@/components/lesson/VideoEmbed";
import { LessonTabs } from "@/components/lesson/LessonTabs";
import { LessonSidebar } from "@/components/lesson/LessonSidebar";

export async function generateStaticParams() {
  const slugs = await getLessonSlugs();
  return slugs.map((slug) => ({ slug }));
}

const META_DESCRIPTION_MAX_LENGTH = 160;

export async function generateMetadata({
  params,
}: PageProps<"/lessons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) return {};

  const title = lesson.context ? `${lesson.title} · ${lesson.context.courseTitle}` : lesson.title;
  const description =
    toPlainText(lesson.notes).slice(0, META_DESCRIPTION_MAX_LENGTH).trim() || undefined;
  const image = lesson.poster ? urlFor(lesson.poster).width(1200).height(630).url() : undefined;

  return {
    title,
    description,
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { title, description, images: image ? [image] : undefined },
  };
}

export default async function LessonPage({
  params,
  searchParams,
}: PageProps<"/lessons/[slug]">) {
  const { slug } = await params;
  const search = await searchParams;

  const lesson = await getLessonBySlug(slug);
  if (!lesson || !lesson.context) notFound();

  const course = await getCourseBySlug(lesson.context.courseSlug);
  if (!course) notFound();

  const flat = flattenLessons(course);
  const currentIndex = flat.findIndex((l) => l._id === lesson._id);
  const prev = currentIndex > 0 ? flat[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null;

  const rawStart = Array.isArray(search.start) ? search.start[0] : search.start;
  const startSeconds = Math.max(0, parseInt(rawStart ?? "0", 10) || 0);

  return (
    <LessonProgressProvider lessonSlug={lesson.slug}>
      <div className="flex-1">
        <Header />

        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 md:py-14">
          <LessonHero
            title={lesson.title}
            duration={lesson.duration}
            studentCount={lesson.studentCount}
            context={lesson.context}
            instructor={course.instructor}
            prev={prev}
            next={next}
          />

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
            <div>
              <VideoEmbed
                videoUrl={lesson.videoUrl}
                title={lesson.title}
                startSeconds={startSeconds}
                lessonSlug={lesson.slug}
              />

              <div className="mt-8">
                <LessonTabs
                  keyPoints={lesson.keyPoints ?? []}
                  notes={lesson.notes}
                  proTip={lesson.proTip}
                  resources={lesson.resources ?? []}
                />
              </div>
            </div>

            <LessonSidebar course={course} currentLessonId={lesson._id} />
          </div>
        </div>

        <Footer />
      </div>
    </LessonProgressProvider>
  );
}
