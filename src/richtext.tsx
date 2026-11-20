import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import { PortableText } from '@portabletext/react'
import { isSafeUrl, type BodyBlock } from './model'

export function Markdown({
  children,
  archive = false,
  blocks,
}: {
  children: string
  archive?: boolean
  blocks?: BodyBlock[]
}) {
  const link = (href: string | undefined, label: ReactNode) => {
    if (!href || (!isSafeUrl(href) && !/^mailto:[^\s@]+@[^\s@]+$/.test(href)))
      return <span>{label}</span>
    if (
      archive &&
      /forms\.gle|docs\.google\.com\/forms|go\.spe\.org|spe-events\.org\/workshop/i.test(
        href,
      )
    )
      return (
        <span>
          {label}{' '}
          <small className="meta">(historical registration; closed)</small>
        </span>
      )
    return (
      <a
        href={href}
        rel={href.startsWith('https:') ? 'noopener noreferrer' : undefined}
      >
        {label}
      </a>
    )
  }
  if (blocks?.length)
    return (
      <PortableText
        value={blocks}
        components={{
          block: { h1: ({ children: heading }) => <h2>{heading}</h2> },
          marks: {
            link: ({ value, children: label }) =>
              link(
                typeof value?.href === 'string' ? value.href : undefined,
                label,
              ),
          },
          types: {
            image: ({ value }) =>
              typeof value.url === 'string' && isSafeUrl(value.url) ? (
                <figure>
                  <img src={value.url} alt={value.alt || ''} loading="lazy" />
                </figure>
              ) : null,
          },
        }}
      />
    )
  return (
    <ReactMarkdown
      skipHtml
      components={{
        h1: ({ children: heading }) => <h2>{heading}</h2>,
        a: ({ href, children: label }) => link(href, label),
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
