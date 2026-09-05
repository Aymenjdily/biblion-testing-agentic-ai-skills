import type { CourseDetail } from "@/sanity/lib/queries";
import { toSeconds } from "@/lib/duration";

/**
 * Placeholder enrollment/progress state for the course page's enrollment
 * panel and lesson-row checkmarks. There is no learner progress backend yet
 * (a separate future feature) — this derives a plausible in-progress state
 * from the course's real lessons so labels, links, and durations are real,
 * while "is this lesson done" is mocked. Swap for a real per-user read once
 * progress tracking exists.
 */

export type FlatLesson = CourseDetail["modules"][number]["lessons"][number] & {
  moduleIndex: number;
  lessonIndex: number;
  moduleTitle: string;
};

export type MockProgress = {
  percent: number;
  completedCount: number;
  totalLessons: number;
  completedLessonIds: Set<string>;
  resume: {
    lesson: FlatLesson;
    resumeSeconds: number;
  } | null;
};

export type LessonProgress = {
  percent: number;
  totalLessons: number;
  currentIndex: number;
  completedLessonIds: Set<string>;
};

export function flattenLessons(course: CourseDetail): FlatLesson[] {
  return course.modules.flatMap((courseModule, moduleIndex) =>
    courseModule.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      moduleIndex,
      lessonIndex,
      moduleTitle: courseModule.title,
    })),
  );
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function computeMockProgress(course: CourseDetail): MockProgress {
  const flat = flattenLessons(course);
  const total = flat.length;
  // Deterministic per-course completed count (1..total-1) so different courses land on
  // different, but stable, progress — picking the count directly (rather than a ratio
  // rounded against a small lesson total) avoids several courses colliding on one value.
  const completedCount = total > 1 ? 1 + (hashString(course._id) % (total - 1)) : 0;
  const completed = flat.slice(0, completedCount);
  const resumeLesson = completedCount < total ? flat[completedCount] : null;

  return {
    percent: total > 0 ? Math.round((completedCount / total) * 100) : 0,
    completedCount,
    totalLessons: total,
    completedLessonIds: new Set(completed.map((l) => l._id)),
    resume: resumeLesson
      ? { lesson: resumeLesson, resumeSeconds: Math.floor(toSeconds(resumeLesson.duration) / 2) }
      : null,
  };
}

/**
 * Progress mocked relative to the lesson actually being viewed: everything
 * before it is "done", it's the active row, everything after is upcoming.
 * More honest for a lesson page than computeMockProgress's independent,
 * unrelated resume pick (used on the course/catalog pages instead).
 */
export function computeLessonProgress(course: CourseDetail, lessonId: string): LessonProgress {
  const flat = flattenLessons(course);
  const currentIndex = flat.findIndex((l) => l._id === lessonId);
  const total = flat.length;
  const completed = currentIndex >= 0 ? flat.slice(0, currentIndex) : [];

  return {
    percent: total > 0 && currentIndex >= 0 ? Math.round((currentIndex / total) * 100) : 0,
    totalLessons: total,
    currentIndex,
    completedLessonIds: new Set(completed.map((l) => l._id)),
  };
}
