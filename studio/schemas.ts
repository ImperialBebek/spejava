import { defineArrayMember, defineField, defineType } from 'sanity'

const safeUrl = defineField({
  name: 'href',
  title: 'Link',
  type: 'url',
  validation: (rule) =>
    rule.required().uri({ allowRelative: true, scheme: ['https', 'mailto'] }),
})
const image = defineField({
  name: 'image',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  description:
    'The migrated image stays in place until you upload a replacement.',
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description:
        'Describe what the image communicates. Do not repeat the file name.',
      validation: (rule) => rule.required(),
    }),
  ],
})
const body = defineField({
  name: 'body',
  title: 'Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading', value: 'h2' },
        { title: 'Subheading', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bulleted list', value: 'bullet' },
        { title: 'Numbered list', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [safeUrl],
          }),
        ],
      },
    }),
    defineArrayMember({ ...image, name: undefined, type: 'image' }),
  ],
  validation: (rule) => rule.required().min(1),
})
const slug = defineField({
  name: 'slug',
  title: 'URL identifier',
  type: 'slug',
  options: { source: 'title', maxLength: 150 },
  readOnly: ({ document }) => !!document?.legacySlug,
  description:
    'Existing migrated addresses are locked. A published address must not change.',
  validation: (rule) =>
    rule.required().custom(async (value, context) => {
      if (!value?.current || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current))
        return 'Use lowercase words separated by hyphens.'
      const id = context.document?._id.replace(/^drafts\./, '')
      if (!id) return true
      try {
        const published = await context
          .getClient({ apiVersion: '2025-02-19' })
          .withConfig({ perspective: 'published' })
          .fetch<{
            slug: string
          } | null>('*[_id == $id][0]{"slug": slug.current}', { id })
        return (
          !published?.slug ||
          published.slug === value.current ||
          'Published URLs cannot change. Keep the existing identifier.'
        )
      } catch {
        return 'Could not verify the existing address. Reconnect and try again.'
      }
    }),
})
const migrationFields = [
  defineField({
    name: 'legacySlug',
    type: 'string',
    hidden: true,
    readOnly: true,
  }),
  defineField({
    name: 'legacyImage',
    type: 'string',
    hidden: true,
    readOnly: true,
  }),
  defineField({
    name: 'legacyAlt',
    type: 'string',
    hidden: true,
    readOnly: true,
  }),
  defineField({
    name: 'legacyWidth',
    type: 'number',
    hidden: true,
    readOnly: true,
  }),
  defineField({
    name: 'legacyHeight',
    type: 'number',
    hidden: true,
    readOnly: true,
  }),
  defineField({
    name: 'legacyBody',
    type: 'text',
    hidden: true,
    readOnly: true,
  }),
]

const event = defineField({
  name: 'event',
  title: 'Event details',
  type: 'object',
  hidden: ({ document }) => document?.kind !== 'event',
  validation: (rule) =>
    rule.custom((value, context) =>
      context.document?.kind === 'event' && !value
        ? 'Event details are required.'
        : true,
    ),
  fields: [
    defineField({
      name: 'start',
      title: 'Start date',
      type: 'date',
      description:
        'Leave blank if not confirmed. An unknown date is shown as TBC.',
    }),
    defineField({
      name: 'end',
      title: 'End date',
      type: 'date',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { start?: string }
          return value && parent.start && value < parent.start
            ? 'End date must not precede the start.'
            : true
        }),
    }),
    defineField({
      name: 'venue',
      type: 'string',
      description: 'Leave blank until confirmed.',
    }),
    defineField({
      name: 'format',
      type: 'string',
      options: {
        list: [
          'Workshop',
          'Symposium',
          'Technical talk',
          'AES',
          'Young Professionals',
          'Partner event',
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'registrationUrl',
      title: 'External registration URL',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'registrationStatus',
      title: 'Registration',
      type: 'string',
      initialValue: 'tbc',
      options: {
        list: [
          { title: 'Not confirmed', value: 'tbc' },
          { title: 'Open', value: 'open' },
          { title: 'Closed', value: 'closed' },
        ],
      },
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const parent = context.parent as {
            start?: string
            registrationUrl?: string
          }
          return value === 'open' && (!parent.start || !parent.registrationUrl)
            ? 'Confirm the date and registration URL before opening registration.'
            : true
        }),
    }),
  ],
})

const post = defineType({
  name: 'post',
  title: 'Stories and events',
  type: 'document',
  initialValue: {
    kind: 'article',
    language: 'en',
    category: 'Section news',
    featured: false,
    reviewRequired: true,
    archived: false,
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(220),
    }),
    slug,
    defineField({
      name: 'kind',
      type: 'string',
      options: {
        list: [
          { title: 'Story', value: 'article' },
          { title: 'Event', value: 'event' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Summary and SEO description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(300),
    }),
    image,
    body,
    defineField({
      name: 'date',
      title: 'Publication date',
      type: 'date',
      description: 'Leave blank for an unknown legacy date.',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      description: 'Leave blank unless confirmed.',
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          'Industry news',
          'Students',
          'Section news',
          'Technical perspectives',
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Bahasa Indonesia', value: 'id' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Feature on the site',
      type: 'boolean',
    }),
    defineField({
      name: 'reviewRequired',
      title: 'Editorial review required',
      type: 'boolean',
      description:
        'While checked, this record is excluded from story listings and marked noindex. Clear it only after SPE Java approves the content.',
    }),
    defineField({
      name: 'archived',
      title: 'Historical registration announcement',
      type: 'boolean',
      description:
        'Shows an archive notice and disables registration links in the article body.',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Original source',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
    event,
    ...migrationFields,
  ],
  preview: { select: { title: 'title', subtitle: 'kind', media: 'image' } },
})

const chapter = defineType({
  name: 'chapter',
  title: 'Student chapters',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'University name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    { ...slug, options: { source: 'name' } },
    defineField({
      name: 'city',
      type: 'string',
      description: 'Leave blank until verified.',
    }),
    image,
    defineField({
      name: 'description',
      title: 'Short introduction',
      type: 'text',
      rows: 3,
    }),
    body,
    defineField({
      name: 'website',
      title: 'Approved chapter website',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'email',
      title: 'Approved public contact email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    ...migrationFields,
  ],
  preview: { select: { title: 'name', media: 'image' } },
})

const program = defineType({
  name: 'program',
  title: 'Programmes and editions',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    {
      ...slug,
      options: { source: 'title' },
      validation: (rule) =>
        rule
          .required()
          .custom(
            (value) =>
              ['aes', 'scholarship'].includes(
                (value as { current?: string } | undefined)?.current || '',
              ) || 'Use aes or scholarship for the existing programme address.',
          ),
    },
    defineField({
      name: 'year',
      title: 'Historical archive year',
      type: 'number',
    }),
    body,
    defineField({
      name: 'registrationUrl',
      title: 'Historical registration URL',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'registrationStatus',
      title: 'Archive state',
      type: 'string',
      initialValue: 'tbc',
      options: { list: ['tbc', 'closed'] },
    }),
    defineField({
      name: 'editions',
      title: 'New editions and application rounds',
      type: 'array',
      description:
        'Open application links appear only within their confirmed date window. Dates use Asia/Jakarta.',
      of: [
        defineArrayMember({
          name: 'edition',
          type: 'object',
          fields: [
            defineField({
              name: 'year',
              type: 'number',
              validation: (rule) =>
                rule.required().integer().min(1979).max(2100),
            }),
            defineField({
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'opens',
              title: 'Applications open',
              type: 'date',
            }),
            defineField({
              name: 'closes',
              title: 'Applications close',
              type: 'date',
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as { opens?: string }
                  return value && parent.opens && value < parent.opens
                    ? 'Closing date must follow opening date.'
                    : true
                }),
            }),
            defineField({
              name: 'registrationUrl',
              title: 'Approved registration URL',
              type: 'url',
              validation: (rule) => rule.uri({ scheme: ['https'] }),
            }),
            defineField({
              name: 'status',
              type: 'string',
              initialValue: 'tbc',
              options: { list: ['tbc', 'open', 'closed'] },
              validation: (rule) =>
                rule.required().custom((value, context) => {
                  const parent = context.parent as {
                    opens?: string
                    closes?: string
                    registrationUrl?: string
                  }
                  return value === 'open' &&
                    (!parent.opens || !parent.closes || !parent.registrationUrl)
                    ? 'Confirm both dates and the registration URL before opening.'
                    : true
                }),
            }),
            body,
            defineField({
              name: 'sponsors',
              title: 'Edition supporters',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'sponsor',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'name',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'website',
                      type: 'url',
                      validation: (rule) => rule.uri({ scheme: ['https'] }),
                    }),
                    image,
                    defineField({
                      name: 'approved',
                      title: 'Approved by SPE Java for this edition',
                      type: 'boolean',
                      initialValue: false,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
      validation: (rule) =>
        rule.custom((value) => {
          const years = (value || []).map(
            (item) => (item as { year?: number }).year,
          )
          return (
            new Set(years).size === years.length ||
            'Each edition needs a unique year.'
          )
        }),
    }),
    ...migrationFields,
  ],
  preview: { select: { title: 'title' } },
})

export const schemas = [post, chapter, program]
