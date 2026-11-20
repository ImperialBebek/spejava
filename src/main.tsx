import { hydrateRoot, createRoot } from 'react-dom/client'
import createApp from './App'
import { snapshot } from './data'
import { validateContent } from './validation'
import './styles.css'

const payload = document.getElementById('spe-content')?.textContent
const content = payload ? validateContent(JSON.parse(payload), 'sanity') : snapshot
const app = await createApp({ path: window.location.pathname, content })
const root = document.getElementById('root')!
if (root.children.length > 0) hydrateRoot(root, app)
else createRoot(root).render(app)
