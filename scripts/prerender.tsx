import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { renderToString } from 'react-dom/server'
import App from '../src/App'

const template = await readFile('dist/index.html', 'utf8')
await writeFile('dist/index.html', template.replace('<!--app-html-->', renderToString(<App />)))
await copyFile('spe-join-member.mp4', 'dist/spe-join-member.mp4')
