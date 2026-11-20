import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  project: { basePath: '/admin' },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})
