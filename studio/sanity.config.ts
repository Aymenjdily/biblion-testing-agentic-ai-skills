import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { schema } from './schemaTypes'
import { structure } from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const apiVersion = process.env.SANITY_STUDIO_API_VERSION || '2026-09-04'

if (!projectId) {
  throw new Error('Missing environment variable: SANITY_STUDIO_PROJECT_ID')
}

export default defineConfig({
  name: 'biblion',
  title: 'Biblion',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    // Vision lets you run GROQ queries from inside the Studio.
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
