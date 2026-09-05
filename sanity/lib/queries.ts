import { defineQuery } from 'next-sanity'

import { sanityFetch } from './fetch'

const COURSE_CARD_PROJECTION = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  summary,
  coverImage,
  level,
  price,
  popular,
  studentCount,
  "instructor": instructor->{ _id, name, "slug": slug.current, photo },
  "category": category->{ _id, title, "slug": slug.current },
}`

export const COURSES_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] | order(title asc) ${COURSE_CARD_PROJECTION}
`)

export async function getCourses() {
  return sanityFetch<CourseCard[]>(COURSES_QUERY)
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
        poster,
        duration,
        freePreview,
        studentCount,
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
    poster,
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

export type LessonContext = {
  courseTitle: string
  courseSlug: string
  moduleIndex: number
  moduleTitle: string
  lessonIndex: number
}

export async function getLessonBySlug(slug: string) {
  const lesson = await sanityFetch<LessonBySlugResult | null>(LESSON_BY_SLUG_QUERY, { slug })
  if (!lesson) return null

  const { course, ...rest } = lesson
  let context: LessonContext | null = null

  if (course) {
    const moduleIndex = course.modules.findIndex((courseModule) =>
      courseModule.lessons?.some((ref: { _ref: string }) => ref._ref === lesson._id),
    )
    const courseModule = moduleIndex >= 0 ? course.modules[moduleIndex] : undefined
    const lessonIndex =
      courseModule?.lessons?.findIndex((ref: { _ref: string }) => ref._ref === lesson._id) ?? -1

    if (courseModule && lessonIndex >= 0) {
      context = {
        courseTitle: course.title,
        courseSlug: course.slug,
        moduleIndex,
        moduleTitle: courseModule.title,
        lessonIndex,
      }
    }
  }

  return { ...rest, context }
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
  title: string
  slug: string
  summary: string
  coverImage: SanityImageRef
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  popular: boolean
  studentCount: number
  instructor: { _id: string; name: string; slug: string; photo: SanityImageRef }
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
      duration: string
      freePreview: boolean
      studentCount: number
    }[]
  }[]
}

type LessonBySlugResult = {
  _id: string
  title: string
  slug: string
  videoUrl: string
  poster: SanityImageRef
  duration: string
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
