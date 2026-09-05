import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CatalogSearchForm } from "@/components/catalog/CatalogSearchForm";
import { CatalogExplorer } from "@/components/catalog/CatalogExplorer";
import { ContinueLearningCard } from "@/components/catalog/ContinueLearningCard";
import { getCategories, getCourseBySlug, getCourses } from "@/sanity/lib/queries";
import { computeMockProgress } from "@/lib/mock-progress";

const CONTINUE_LEARNING_COUNT = 2;

export async function generateMetadata(): Promise<Metadata> {
  const [courses, categories] = await Promise.all([getCourses(), getCategories()]);
  const description = `Browse ${courses.length} course${courses.length === 1 ? "" : "s"} across ${categories.length} categor${categories.length === 1 ? "y" : "ies"} — every lesson searchable down to the exact moment.`;

  return {
    title: "Course catalog",
    description,
    openGraph: { title: "Course catalog", description },
    twitter: { title: "Course catalog", description },
  };
}

export default async function CatalogPage() {
  const [courses, categories] = await Promise.all([getCourses(), getCategories()]);

  // Static/mock "in progress" demo state (no progress backend yet — see
  // prompts/course-page.md) applied to the first couple of courses so the
  // "Continue learning" strip and the matching grid cards stay consistent.
  const enrolledCandidates = courses.slice(0, CONTINUE_LEARNING_COUNT);
  const enrolledDetails = await Promise.all(
    enrolledCandidates.map((c) => getCourseBySlug(c.slug)),
  );

  const enrolledProgress = new Map<string, ReturnType<typeof computeMockProgress>>();
  const continueLearning: { courseTitle: string; progress: ReturnType<typeof computeMockProgress> }[] =
    [];

  for (const detail of enrolledDetails) {
    if (!detail) continue;
    const progress = computeMockProgress(detail);
    if (!progress.resume) continue;
    enrolledProgress.set(detail._id, progress);
    continueLearning.push({ courseTitle: detail.title, progress });
  }

  return (
    <div className="flex-1">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 md:py-14">
        <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] text-ember-600">
          <span className="h-2 w-2 bg-ember-600" />
          CATALOG
        </p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-4xl font-bold text-ink-900">All courses</h1>
          <p className="font-mono text-[11px] tracking-wide text-neutral-400">
            {courses.length} COURSES
          </p>
        </div>

        <p className="mt-3 max-w-2xl text-[15px] text-neutral-600">
          Production-grade paths, taught by engineers who ship. Every lesson searchable to the
          second.
        </p>

        <CatalogSearchForm />

        {continueLearning.length > 0 && (
          <div className="mt-10">
            <p className="font-mono text-[11px] tracking-wide text-neutral-400">
              CONTINUE LEARNING
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {continueLearning.map(({ courseTitle, progress }) => (
                <ContinueLearningCard
                  key={courseTitle}
                  courseTitle={courseTitle}
                  progress={progress}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <CatalogExplorer
            courses={courses}
            categories={categories}
            enrolledProgress={enrolledProgress}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
