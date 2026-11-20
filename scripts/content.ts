import { readdir, readFile, writeFile } from 'node:fs/promises'
import { validateContent } from '../src/validation'

async function readCollection(folder: string) {
  return Promise.all(
    (await readdir(folder))
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map(async (name) => {
        const value = JSON.parse(await readFile(`${folder}/${name}`, 'utf8'))
        if (value.slug !== name.slice(0, -5))
          throw new Error(`Slug does not match filename: ${name}`)
        return value
      }),
  )
}
const content = validateContent(
  {
    posts: await readCollection('content/articles'),
    chapters: await readCollection('content/chapters'),
    programs: await readCollection('content/programs'),
  },
  'snapshot',
)
await writeFile(
  'src/generated-content.ts',
  `import type { Post, Chapter, Program } from './model'\n\nexport const posts: Post[] = ${JSON.stringify(content.posts, null, 2)}\n\nexport const chapters: Chapter[] = ${JSON.stringify(content.chapters, null, 2)}\n\nexport const programs: Program[] = ${JSON.stringify(content.programs, null, 2)}\n`,
)
console.log(
  `Content snapshot: ${content.posts.length} posts, ${content.chapters.length} chapters, ${content.programs.length} programs`,
)
