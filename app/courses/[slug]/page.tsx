import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug, getCourseSlugs } from "@/sanity/lib/queries";
import { getPostHogClient } from "@/lib/posthog-server";
import { urlFor } from "@/sanity/lib/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CourseHero } from "@/components/course/CourseHero";
import { VideoPreviewCard } from "@/components/course/VideoPreviewCard";
import { EnrollmentCard } from "@/components/course/EnrollmentCard";
import { InstructorSection } from "@/components/course/InstructorSection";
import { WhatYoullLearn } from "@/components/course/WhatYoullLearn";
import { CourseContent } from "@/components/course/CourseContent";
import { formatDurationTotal, toSeconds } from "@/lib/duration";
import { computeMockProgress } from "@/lib/mock-progress";

export async function generateStaticParams() {
  const slugs = await getCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};

  const image = course.coverImage ? urlFor(course.coverImage).width(1200).height(630).url() : undefined;

  return {
    title: course.title,
    description: course.summary,
    openGraph: { title: course.title, description: course.summary, images: image ? [image] : undefined },
    twitter: { title: course.title, description: course.summary, images: image ? [image] : undefined },
  };
}

export default async function CoursePage({
  params,
}: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) notFound();

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const totalDurationLabel = formatDurationTotal(
    allLessons.reduce((sum, l) => sum + toSeconds(l.duration), 0),
  );
  const resourceCount = allLessons.reduce((sum, l) => sum + l.resourceCount, 0);
  const progress = computeMockProgress(course);

  const posthog = getPostHogClient();
  if (posthog) {
    posthog.capture({
      distinctId: "anonymous",
      event: "course_viewed",
      properties: {
        course_slug: slug,
        course_title: course.title,
        category: course.category.title,
        total_lessons: totalLessons,
      },
    });
    await posthog.flush();
  }

  return (
    <div className="flex-1">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 md:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <CourseHero
            course={course}
            totalLessons={totalLessons}
            totalDurationLabel={totalDurationLabel}
          />

          <div className="flex flex-col gap-4">
            <VideoPreviewCard course={course} />
            <EnrollmentCard
              progress={progress}
              resourceCount={resourceCount}
              firstLessonSlug={allLessons[0]?.slug}
            />
          </div>
        </div>
      </div>

      <InstructorSection instructor={course.instructor} />
      <WhatYoullLearn outcomes={course.learningOutcomes} />
      <CourseContent
        course={course}
        progress={progress}
        totalLessons={totalLessons}
        totalDurationLabel={totalDurationLabel}
      />

      <Footer />
    </div>
  );
}
