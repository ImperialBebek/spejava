import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemas } from './schemas'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
if (!projectId)
  throw new Error('Set SANITY_STUDIO_PROJECT_ID before building the editor.')

export default defineConfig({
  name: 'spe-java',
  title: 'SPE Java Section',
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool()],
  schema: { types: schemas },
})
