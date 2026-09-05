import { defineQuery } from 'next-sanity'

import { sanityFetch } from './fetch'

const COURSE_CARD_PROJECTION = /* groq */ `{
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  code,
  summary,
  coverImage,
  level,
  price,
  popular,
  studentCount,
  rating,
  ratingCount,
  tags,
  "instructor": instructor->{ _id, name, "slug": slug.current, photo, bio },
  "category": category->{ _id, title, "slug": slug.current },
}`

export const COURSES_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] | order(title asc) {
    ...${COURSE_CARD_PROJECTION},
    "lessonDurations": modules[].lessons[]->duration,
  }
`)

export type CourseListItem = CourseCard & {
  // One array per module, each holding that module's lesson durations —
  // kept lightweight (durations only) so the catalog list query stays cheap.
  lessonDurations: (string | number)[][]
  // Derived from _createdAt at fetch time (not stored, not computed at render
  // time in a component — see the "New" badge note in prompts/catalog-page.md).
  isNew: boolean
}

const NEW_WINDOW_MS = 60 * 24 * 60 * 60 * 1000 // 60 days

export async function getCourses() {
  const courses = await sanityFetch<(CourseCard & { lessonDurations: (string | number)[][] })[]>(
    COURSES_QUERY,
  )
  const now = Date.now()
  return courses.map((course) => ({
    ...course,
    isNew: now - new Date(course._createdAt).getTime() < NEW_WINDOW_MS,
  }))
}

// Landing page "search demo" card — illustrative, not live search (search itself is a
// separate future feature), but the course/lesson identities it shows are real content,
// never invented.
export const FEATURED_LESSON_MOMENTS_QUERY = defineQuery(`
  *[_type == "course"] | order(popular desc, title asc) [0...3]{
    title,
    "slug": slug.current,
    "category": category->title,
    modules[]{
      title,
      lessons[]->{
        title,
        "slug": slug.current,
        "poster": coalesce(poster, thumbnail),
        duration,
        keyPoints,
      },
    },
  }
`)

type FeaturedCourseResult = {
  title: string
  slug: string
  category: string
  modules: {
    title: string
    lessons: {
      title: string
      slug: string
      poster: SanityImageRef
      duration: string | number
      keyPoints?: string[]
    }[]
  }[]
}

export type FeaturedLessonMoment = {
  courseTitle: string
  courseSlug: string
  moduleIndex: number
  lessonIndex: number
  lessonTitle: string
  lessonSlug: string
  poster: SanityImageRef
  duration: string | number
  description: string
}

export async function getFeaturedLessonMoments(): Promise<FeaturedLessonMoment[]> {
  const courses = await sanityFetch<FeaturedCourseResult[]>(FEATURED_LESSON_MOMENTS_QUERY)

  return courses.flatMap((course) => {
    // Pick one representative lesson per course: the second module's first lesson
    // when there is one, otherwise the course's first lesson.
    const moduleIndex = course.modules.length > 1 ? 1 : 0
    const lessonIndex = 0
    const lesson = course.modules[moduleIndex]?.lessons[lessonIndex]
    if (!lesson) return []

    return [
      {
        courseTitle: course.title,
        courseSlug: course.slug,
        moduleIndex,
        lessonIndex,
        lessonTitle: lesson.title,
        lessonSlug: lesson.slug,
        poster: lesson.poster,
        duration: lesson.duration,
        description: lesson.keyPoints?.[0] ?? '',
      },
    ]
  })
}

export const COURSE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "course" && slug.current == $slug][0]{
    ...${COURSE_CARD_PROJECTION},
    learningOutcomes,
    modules[]{
      _key,
      title,
      summary,
      lessons[]->{
        _id,
        title,
        "slug": slug.current,
        "poster": coalesce(poster, thumbnail),
        duration,
        freePreview,
        studentCount,
        "resourceCount": count(resources),
      },
    },
  }
`)

export async function getCourseBySlug(slug: string) {
  return sanityFetch<CourseDetail | null>(COURSE_BY_SLUG_QUERY, { slug })
}

export const COURSE_SLUGS_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)].slug.current
`)

export async function getCourseSlugs() {
  return sanityFetch<string[]>(COURSE_SLUGS_QUERY)
}

export const LESSON_BY_SLUG_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    "poster": coalesce(poster, thumbnail),
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources,
    "course": *[_type == "course" && references(^._id)][0]{
      _id,
      title,
      "slug": slug.current,
      modules[]{ title, lessons },
    },
  }
`)

export const LESSON_SLUGS_QUERY = defineQuery(`
  *[_type == "lesson" && defined(slug.current)].slug.current
`)

export async function getLessonSlugs() {
  return sanityFetch<string[]>(LESSON_SLUGS_QUERY)
}

export type LessonContext = {
  courseTitle: string
  courseSlug: string
  courseLevel: CourseCard['level'] | null
  moduleIndex: number
  moduleTitle: string
  lessonIndex: number
}

function deriveLessonContext(
  lessonId: string,
  course: {
    title: string
    slug: string
    level?: CourseCard['level']
    modules: { title: string; lessons: { _ref: string }[] }[]
  } | null,
): LessonContext | null {
  if (!course) return null

  const moduleIndex = course.modules.findIndex((courseModule) =>
    courseModule.lessons?.some((ref) => ref._ref === lessonId),
  )
  const courseModule = moduleIndex >= 0 ? course.modules[moduleIndex] : undefined
  const lessonIndex = courseModule?.lessons?.findIndex((ref) => ref._ref === lessonId) ?? -1

  if (!courseModule || lessonIndex < 0) return null

  return {
    courseTitle: course.title,
    courseSlug: course.slug,
    courseLevel: course.level ?? null,
    moduleIndex,
    moduleTitle: courseModule.title,
    lessonIndex,
  }
}

export async function getLessonBySlug(slug: string) {
  const lesson = await sanityFetch<LessonBySlugResult | null>(LESSON_BY_SLUG_QUERY, { slug })
  if (!lesson) return null

  const { course, ...rest } = lesson
  const context = deriveLessonContext(lesson._id, course)

  return { ...rest, context }
}

// Batch lesson fetch by _id, used to resolve real display data for search
// results after the search agent identifies matching lesson ids — never
// trust the agent's own account of a lesson's title/duration/labels.
export const LESSONS_BY_IDS_QUERY = defineQuery(`
  *[_type == "lesson" && _id in $ids]{
    _id,
    title,
    "slug": slug.current,
    "poster": coalesce(poster, thumbnail),
    duration,
    freePreview,
    keyPoints,
    "course": *[_type == "course" && references(^._id)][0]{
      title,
      "slug": slug.current,
      level,
      modules[]{ title, lessons },
    },
    "video": *[_type == "video" && url == ^.videoUrl][0]{
      chapters,
      chunks,
    },
  }
`)

export type VideoMoment = { startSeconds: number; label: string }

export type LessonSearchResult = {
  _id: string
  title: string
  slug: string
  poster: SanityImageRef
  duration: string | number
  freePreview: boolean
  keyPoints: string[]
  context: LessonContext | null
  // Real chapters/chunks for this lesson's video — used to verify (never
  // trust) a search agent's claimed matchedSecond, and to resolve the real
  // label to display for it.
  chapters: VideoMoment[]
  chunks: VideoMoment[]
}

type LessonsByIdsResult = Omit<LessonSearchResult, 'context' | 'chapters' | 'chunks'> & {
  course: {
    title: string
    slug: string
    level?: CourseCard['level']
    modules: { title: string; lessons: { _ref: string }[] }[]
  } | null
  video: { chapters: VideoMoment[] | null; chunks: VideoMoment[] | null } | null
}

export async function getLessonsByIds(ids: string[]): Promise<LessonSearchResult[]> {
  if (ids.length === 0) return []
  const lessons = await sanityFetch<LessonsByIdsResult[]>(LESSONS_BY_IDS_QUERY, { ids })

  return lessons.map((lesson) => {
    const { course, video, ...rest } = lesson
    return {
      ...rest,
      context: deriveLessonContext(lesson._id, course),
      chapters: video?.chapters ?? [],
      chunks: video?.chunks ?? [],
    }
  })
}

// Real, cheap aggregate stats for the search page's "browse the full
// catalog" callout — never a fabricated round number.
export const SEARCH_STATS_QUERY = defineQuery(`{
  "courseCount": count(*[_type == "course"]),
  "momentCount": count(*[_type == "video"].chapters[])
}`)

export type SearchStats = { courseCount: number; momentCount: number }

export async function getSearchStats() {
  return sanityFetch<SearchStats>(SEARCH_STATS_QUERY)
}

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "instructor" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    photo,
    expertise,
    bio,
    "courses": *[_type == "course" && references(^._id)]${COURSE_CARD_PROJECTION},
  }
`)

export async function getInstructorBySlug(slug: string) {
  return sanityFetch<InstructorDetail | null>(INSTRUCTOR_BY_SLUG_QUERY, { slug })
}

export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category" && defined(slug.current)] | order(title asc){
    _id,
    title,
    "slug": slug.current,
    description,
  }
`)

export async function getCategories() {
  return sanityFetch<Category[]>(CATEGORIES_QUERY)
}

// --- Minimal hand-written types until `npm run typegen` generates sanity.types.ts from the Studio ---

type SanityImageRef = { asset?: { _ref: string; _type: 'reference' } }

export type CourseCard = {
  _id: string
  _createdAt: string
  _updatedAt: string
  title: string
  slug: string
  code: string | null
  summary: string
  coverImage: SanityImageRef
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  popular: boolean
  studentCount: number
  rating: number | null
  ratingCount: number | null
  tags: string[] | null
  instructor: { _id: string; name: string; slug: string; photo: SanityImageRef; bio: string }
  category: { _id: string; title: string; slug: string }
}

export type CourseDetail = CourseCard & {
  learningOutcomes: { icon: string; title: string; description: string }[]
  modules: {
    _key: string
    title: string
    summary?: string
    lessons: {
      _id: string
      title: string
      slug: string
      poster: SanityImageRef
      duration: string | number
      freePreview: boolean
      studentCount: number
      resourceCount: number
    }[]
  }[]
}

type LessonBySlugResult = {
  _id: string
  title: string
  slug: string
  videoUrl: string
  poster: SanityImageRef
  duration: string | number
  freePreview: boolean
  studentCount: number
  notes: unknown
  keyPoints: string[]
  proTip?: string
  resources: { type: string; title: string; description?: string; url: string }[]
  course: {
    _id: string
    title: string
    slug: string
    modules: { title: string; lessons: { _ref: string }[] }[]
  } | null
}

export type Category = { _id: string; title: string; slug: string; description?: string }

export type InstructorDetail = {
  _id: string
  name: string
  slug: string
  photo: SanityImageRef
  expertise: string[]
  bio: string
  courses: CourseCard[]
}
