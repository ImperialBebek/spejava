import { cp, readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { parse } from 'jsonc-parser'

const config = parse(await readFile('wrangler.jsonc', 'utf8'))
const projectId =
  process.env.SANITY_PROJECT_ID || config.vars?.SANITY_PROJECT_ID
if (projectId) {
  const result = spawnSync('npm', ['--prefix', 'studio', 'run', 'build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: 'true',
      SANITY_STUDIO_PROJECT_ID: projectId,
      SANITY_STUDIO_DATASET:
        process.env.SANITY_DATASET ||
        config.vars?.SANITY_DATASET ||
        'production',
    },
  })
  if (result.status !== 0)
    throw new Error(
      'Sanity Studio build failed. Run npm ci --prefix studio before building.',
    )
  await cp('studio/dist', 'dist/admin', { recursive: true })
  console.log('Built the self-hosted Sanity editor at /admin/.')
} else {
  console.log(
    'Sanity project not configured; keeping the explicit editor setup-pending page.',
  )
}
