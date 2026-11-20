import { snapshot } from './data'
import {
  postPath,
  isEditionOpen,
  displayDate,
  type Chapter,
  type Content,
  type Post,
  type Program,
} from './model'

export interface Route {
  path: string
  title: string
  description: string
  section: string
  kind:
    | 'home'
    | 'about'
    | 'events'
    | 'stories'
    | 'chapters'
    | 'chapter'
    | 'membership'
    | 'contact'
    | 'post'
    | 'program'
    | 'not-found'
  language: 'en' | 'id'
  image?: string
  post?: Post
  chapter?: Chapter
  program?: Program
  noindex?: boolean
}
const base = { language: 'en' as const }
function programDescription(program: Program) {
  const edition = program.editions?.find((edition) => isEditionOpen(edition))
  if (edition)
    return `${edition.title}. Applications are open until ${displayDate(edition.closes)}.`
  return `Explore ${program.title}, programme editions and registration information from SPE Java.`
}
export function publicRoutes(content: Content = snapshot): Route[] {
  return [
    {
      ...base,
      path: '/',
      title: 'SPE Java Section',
      description:
        'Knowledge connects Java’s energy community. Discover SPE Java Section, its technical events, student chapters and professional membership.',
      section: '/',
      kind: 'home',
    },
    {
      ...base,
      path: '/about',
      title: 'About SPE Java Section',
      description:
        'Founded in Jakarta on 25 June 1979. Discover the history and community of the Society of Petroleum Engineers, Java Section.',
      section: '/about',
      kind: 'about',
    },
    {
      ...base,
      path: '/events',
      title: 'Events',
      description:
        'Technical talks, workshops and symposiums. Explore confirmed events and the SPE Java archive.',
      section: '/events',
      kind: 'events',
    },
    {
      ...base,
      path: '/blog',
      title: 'Stories from the section',
      description:
        'Technical perspectives, industry news, chapter achievements and stories from Java’s energy community.',
      section: '/blog',
      kind: 'stories',
    },
    {
      ...base,
      path: '/student-chapter',
      title: 'Student chapters',
      description:
        'Find your university in SPE Java’s legacy student chapter directory and learn how to get involved.',
      section: '/student-chapter',
      kind: 'chapters',
    },
    {
      ...base,
      path: '/membership',
      title: 'Membership',
      description:
        'Join or renew through SPE International and connect with technical learning, students and professionals in the Java Section.',
      section: '/membership',
      kind: 'membership',
    },
    {
      ...base,
      path: '/contact',
      title: 'Contact SPE Java',
      description:
        'Membership, student chapters, events or partnerships: find contact information and enquiry options for SPE Java.',
      section: '/contact',
      kind: 'contact',
    },
    ...content.posts.map((post) => ({
      path: postPath(post),
      title: post.title,
      description: post.excerpt || post.title,
      section: post.kind === 'event' ? '/events' : '/blog',
      kind: 'post' as const,
      language: post.language,
      image: post.image,
      post,
      noindex: post.reviewRequired,
    })),
    ...content.chapters.map((chapter) => ({
      ...base,
      path: `/student-chapter/${chapter.slug}`,
      title: `SPE ${chapter.name} Student Chapter`,
      description:
        chapter.description ||
        `${chapter.name} in SPE Java’s legacy directory. Current contacts and roster details await confirmation.`,
      section: '/student-chapter',
      kind: 'chapter' as const,
      chapter,
    })),
    ...content.programs.map((program) => ({
      ...base,
      path: `/${program.slug}`,
      title: program.title,
      description: programDescription(program),
      section: program.slug === 'aes' ? '/events' : '/student-chapter',
      kind: 'program' as const,
      program,
    })),
  ]
}
export function resolveRoute(
  pathname: string,
  content: Content = snapshot,
): Route {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  return (
    publicRoutes(content).find((route) => route.path === path) || {
      ...base,
      path,
      title: 'Page not found',
      description: 'The requested SPE Java page could not be found.',
      section: '',
      kind: 'not-found',
      noindex: true,
    }
  )
}
