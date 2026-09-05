import type { MetadataRoute } from "next";
import { getCourseSlugs, getLessonSlugs } from "@/sanity/lib/queries";
import { siteUrl } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courseSlugs, lessonSlugs] = await Promise.all([getCourseSlugs(), getLessonSlugs()]);

  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/search`, changeFrequency: "weekly", priority: 0.3 },
    ...courseSlugs.map((slug): MetadataRoute.Sitemap[number] => ({
      url: `${siteUrl}/courses/${slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...lessonSlugs.map((slug): MetadataRoute.Sitemap[number] => ({
      url: `${siteUrl}/lessons/${slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    })),
  ];
}
