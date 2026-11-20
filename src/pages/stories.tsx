import { useState } from 'react'
import { Filters, PageHeading, StoryCard, useSortedPosts } from '../components'

export default function StoriesPage() {
  const [language, setLanguage] = useState('All')
  const [category, setCategory] = useState('All')
  const articles = useSortedPosts().filter(
    (post) => post.kind === 'article' && !post.reviewRequired,
  )
  const visible = articles.filter(
    (post) =>
      (language === 'All' || post.language.toUpperCase() === language) &&
      (category === 'All' || post.category === category),
  )
  return (
    <>
      <PageHeading
        title="Stories from the section."
        lead="Technical perspectives, chapter achievements and the people moving Java’s energy community forward."
      />
      <Filters
        legend="Language"
        options={['All', 'EN', 'ID']}
        value={language}
        onChange={setLanguage}
      />
      <Filters
        legend="Category"
        options={['All', ...new Set(articles.map((post) => post.category))]}
        value={category}
        onChange={setCategory}
      />
      <p className="meta search-state" role="status">
        {visible.length} {visible.length === 1 ? 'story' : 'stories'}
      </p>
      <h2 className="sr-only">All stories</h2>
      <div className="grid">
        {visible.map((post) => (
          <StoryCard key={post.slug} post={post} />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty">
          <p>No stories match these filters.</p>
          <button
            className="chip"
            type="button"
            onClick={() => {
              setLanguage('All')
              setCategory('All')
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <noscript>
        <p className="noscript">
          All published stories are listed. Filtering requires JavaScript.
        </p>
      </noscript>
    </>
  )
}
