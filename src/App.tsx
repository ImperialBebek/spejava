import MotionBootstrap from './MotionBootstrap'
import { ButtonLink, Header, PageHeading } from './components'
import { ContentContext, snapshot } from './data'
import type { Content } from './model'
import Footer from './pages/footer'
import { resolveRoute, type Route } from './routes'

async function pageView(route: Route) {
  switch (route.kind) {
    case 'home': {
      const { default: Page } = await import('./pages/home')
      return <Page />
    }
    case 'about': {
      const { default: Page } = await import('./pages/about')
      return <Page />
    }
    case 'events': {
      const { default: Page } = await import('./pages/events')
      return <Page />
    }
    case 'stories': {
      const { default: Page } = await import('./pages/stories')
      return <Page />
    }
    case 'chapters': {
      const { default: Page } = await import('./pages/chapters')
      return <Page />
    }
    case 'chapter': {
      const { ChapterPage } = await import('./pages/chapters')
      return <ChapterPage chapter={route.chapter!} />
    }
    case 'membership': {
      const { default: Page } = await import('./pages/membership')
      return <Page />
    }
    case 'contact': {
      const { default: Page } = await import('./pages/contact')
      return <Page />
    }
    case 'post': {
      const { default: Page } = await import('./pages/post')
      return <Page post={route.post!} />
    }
    case 'program': {
      const { default: Page } = await import('./pages/program')
      return <Page program={route.program!} />
    }
    default:
      return (
        <>
          <PageHeading
            title="This tray is empty."
            lead="The page you’re looking for couldn’t be found. Explore the section or return to the homepage."
            rail="404"
          />
          <div className="actions">
            <ButtonLink href="/">Go to the homepage</ButtonLink>
            <ButtonLink href="/events" secondary>
              Explore events
            </ButtonLink>
          </div>
        </>
      )
  }
}

export default async function createApp({
  path = '/',
  content = snapshot,
}: { path?: string; content?: Content } = {}) {
  const route = resolveRoute(path, content)
  const page = await pageView(route)
  return (
    <ContentContext value={content}>
      <MotionBootstrap />
      <div className={route.kind === 'home' ? 'home-earth' : undefined}>
        <Header section={route.section} />
        <div className="wrap">
          <main id="main">{page}</main>
          {content.source === 'snapshot' && (
            <p className="meta snapshot-note">
              Migration review · Sanity publishing is not connected in this
              build.
            </p>
          )}
          <Footer />
        </div>
      </div>
    </ContentContext>
  )
}
