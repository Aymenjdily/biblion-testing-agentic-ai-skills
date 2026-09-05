/**
 * This configuration file lets you run `$ sanity [command]` in this folder.
 * Go to https://www.sanity.io/docs/cli to learn more.
 */
import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: { projectId, dataset },
  // TypeGen reads GROQ queries from the web app and writes generated types back into it.
  // https://www.sanity.io/docs/sanity-typegen
  typegen: {
    enabled: true,
    path: '../sanity/lib/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../sanity.types.ts',
  },
})
