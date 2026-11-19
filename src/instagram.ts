export const instagramFeedUrl = 'https://api.feedspring.co/inst_CCFbZlX5PQagywf0rOelv'

export type InstagramPost = {
  id: string
  caption: string
  mediaUrl: string
  permalink: string
  likeCount: number
}

export const instagramPosts: InstagramPost[] = [
  { id: '4027907883761032047', caption: 'SPE Distinguished Lecturer 2026 — Beyond Surveillance: Pro-Active Reservoir & Production Engineering', mediaUrl: '/images/instagram-lecturer.webp', permalink: 'https://www.instagram.com/p/DfmAOEnkltv/', likeCount: 110 },
  { id: '4026511761351402384', caption: 'Your voice, our future — SPE Java Aspiration Survey 2026–2028', mediaUrl: '/images/instagram-survey.webp', permalink: 'https://www.instagram.com/p/DfhCx0TSGOQ/', likeCount: 69 },
  { id: '4024351766233677441', caption: 'A new chapter, a bolder vision — SPE Java Indonesia Section leadership 2026–2028', mediaUrl: '/images/instagram-leadership.webp', permalink: 'https://www.instagram.com/p/DfZXpwFkv6B/', likeCount: 350 },
]

export function readInstagramPosts(payload: unknown): InstagramPost[] {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) return []
  const data = payload.data
  if (!data || typeof data !== 'object' || !('media' in data) || !Array.isArray(data.media)) return []

  return data.media.filter((post): post is InstagramPost =>
    post !== null && typeof post === 'object' &&
    typeof post.id === 'string' && typeof post.caption === 'string' &&
    typeof post.mediaUrl === 'string' && post.mediaUrl.startsWith('https://') &&
    typeof post.permalink === 'string' && post.permalink.startsWith('https://www.instagram.com/') &&
    typeof post.likeCount === 'number' && Number.isFinite(post.likeCount) && post.likeCount >= 0,
  ).slice(0, 3)
}
