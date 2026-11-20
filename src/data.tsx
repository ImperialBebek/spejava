import { createContext, useContext } from 'react'
import { posts, chapters, programs } from './generated-content'
import type { Content } from './model'

export const snapshot: Content = {
  posts,
  chapters,
  programs,
  source: 'snapshot',
}
export const ContentContext = createContext<Content>(snapshot)
export const useContent = () => useContext(ContentContext)
