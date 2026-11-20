import { writeFile } from 'node:fs/promises'
import { fromMarkdown } from 'mdast-util-from-markdown'
import type { BlockContent, PhrasingContent, RootContent } from 'mdast'
import { snapshot } from '../src/data'
import type { PortableTextBlock, PortableTextSpan } from '@portabletext/types'

export function portableBody(markdown: string): PortableTextBlock[] {
  let count = 0
  const key = () => `m${count++}`
  const blocks: PortableTextBlock[] = []
  function phrasing(
    nodes: PhrasingContent[],
    marks: string[],
    markDefs: PortableTextBlock['markDefs'],
  ): PortableTextSpan[] {
    return nodes.flatMap((node) => {
      if (node.type === 'text' || node.type === 'inlineCode')
        return [
          {
            _type: 'span',
            _key: key(),
            text: node.value,
            marks: node.type === 'inlineCode' ? [...marks, 'code'] : marks,
          },
        ]
      if (node.type === 'break')
        return [{ _type: 'span', _key: key(), text: '\n', marks }]
      if (node.type === 'strong' || node.type === 'emphasis')
        return phrasing(
          node.children,
          [...marks, node.type === 'strong' ? 'strong' : 'em'],
          markDefs,
        )
      if (node.type === 'link') {
        const id = key()
        markDefs!.push({ _type: 'link', _key: id, href: node.url })
        return phrasing(node.children, [...marks, id], markDefs)
      }
      if (node.type === 'image')
        return [{ _type: 'span', _key: key(), text: node.alt || '', marks }]
      return []
    })
  }
  function visit(
    node: RootContent | BlockContent,
    listItem?: 'bullet' | 'number',
    level = 1,
    quote = false,
  ) {
    if (node.type === 'list') {
      node.children.forEach((item) =>
        item.children.forEach((child) =>
          visit(
            child,
            node.ordered ? 'number' : 'bullet',
            listItem ? level + 1 : level,
          ),
        ),
      )
      return
    }
    if (node.type === 'blockquote') {
      node.children.forEach((child) => visit(child, listItem, level, true))
      return
    }
    if (
      node.type === 'paragraph' ||
      node.type === 'heading' ||
      node.type === 'code'
    ) {
      const markDefs: NonNullable<PortableTextBlock['markDefs']> = []
      const children =
        node.type === 'code'
          ? [
              {
                _type: 'span' as const,
                _key: key(),
                text: node.value,
                marks: ['code'],
              },
            ]
          : phrasing(node.children, [], markDefs)
      blocks.push({
        _type: 'block',
        _key: key(),
        style: quote
          ? 'blockquote'
          : node.type === 'heading'
            ? node.depth <= 2
              ? 'h2'
              : 'h3'
            : 'normal',
        children,
        markDefs,
        ...(listItem ? { listItem, level } : {}),
      })
    }
  }
  fromMarkdown(markdown || '[TBC: approved introduction]').children.forEach(
    (node) => visit(node),
  )
  return blocks
}

const documents = [
  ...snapshot.posts.map(
    ({
      image,
      alt,
      imageWidth,
      imageHeight,
      bodyBlocks: _blocks,
      ...post
    }) => ({
      ...post,
      date: post.date || undefined,
      event: post.event
        ? {
            ...post.event,
            start: post.event.start || undefined,
            end: post.event.end || undefined,
            registrationUrl: post.event.registrationUrl || undefined,
          }
        : undefined,
      _id: `post.${post.slug}`,
      _type: 'post',
      slug: { _type: 'slug', current: post.slug },
      body: portableBody(post.body),
      legacyBody: post.body,
      legacyImage: image,
      legacyAlt: alt,
      legacyWidth: imageWidth,
      legacyHeight: imageHeight,
      legacySlug: post.slug,
      image: undefined,
    }),
  ),
  ...snapshot.chapters.map(({ image, bodyBlocks: _blocks, ...chapter }) => ({
    ...chapter,
    website: chapter.website || undefined,
    email: chapter.email || undefined,
    _id: `chapter.${chapter.slug}`,
    _type: 'chapter',
    slug: { _type: 'slug', current: chapter.slug },
    body: portableBody(chapter.body),
    legacyBody: chapter.body,
    legacyImage: image,
    legacySlug: chapter.slug,
    image: undefined,
  })),
  ...snapshot.programs.map(({ bodyBlocks: _blocks, ...program }) => ({
    ...program,
    year: program.year ?? undefined,
    _id: `program.${program.slug}`,
    _type: 'program',
    slug: { _type: 'slug', current: program.slug },
    body: portableBody(program.body),
    legacyBody: program.body,
    legacySlug: program.slug,
  })),
]
if (process.argv[1]?.endsWith('export-sanity.ts')) {
  await writeFile(
    'studio/migration.ndjson',
    documents.map((document) => JSON.stringify(document)).join('\n') + '\n',
  )
  console.log(
    `Exported ${documents.length} deterministic documents. Import with create-if-absent semantics; existing CMS edits must not be overwritten.`,
  )
}
