import { PlayIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Internal lookup, built by offline ingestion (scripts/ingest-videos.mjs) —
 * never shown to learners directly. Lessons link to these by `url`, not by
 * reference (see AGENTS.md section 8).
 */
export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'Video ID',
      description: 'The provider-native video id (e.g. the YouTube video id)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'chapters',
      title: 'Chapters',
      description: 'Table of contents, parsed from the source (e.g. YouTube description timestamps)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chapter',
          fields: [
            defineField({ name: 'startSeconds', type: 'number', validation: (rule) => rule.required().min(0) }),
            defineField({ name: 'label', type: 'string', validation: (rule) => rule.required() }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'startSeconds' },
          },
        }),
      ],
    }),
    defineField({
      name: 'chunks',
      title: 'Transcript Chunks',
      description: 'Short timestamped transcript pieces — never returned wholesale to the request path',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chunk',
          fields: [
            defineField({ name: 'startSeconds', type: 'number', validation: (rule) => rule.required().min(0) }),
            defineField({ name: 'text', type: 'text', rows: 2, validation: (rule) => rule.required() }),
          ],
          preview: {
            select: { title: 'text', subtitle: 'startSeconds' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'id', chapters: 'chapters' },
    prepare({ title, chapters }) {
      const count = Array.isArray(chapters) ? chapters.length : 0
      return { title, subtitle: `${count} chapter${count === 1 ? '' : 's'}` }
    },
  },
})
