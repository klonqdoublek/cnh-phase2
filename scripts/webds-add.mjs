// Install webds registry items verbatim, the way CMS does: each file lands at
// src/<target> (or public/ for `~/public/…` targets), byte-identical, so
// `npm run audit` can tell an install from an edit. Follows registryDependencies.
// Usage: node scripts/webds-add.mjs <item> [<item> …]
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const REGISTRY = 'https://webds-bbl.vercel.app/r'
const root = new URL('..', import.meta.url).pathname
const index = await (await fetch(`${REGISTRY}/registry.json`)).json()
const urlOf = (name) =>
  name.startsWith('http') ? name : index.items.find((i) => i.name === name)?.url
const seen = new Set()

async function add(name) {
  const url = urlOf(name)
  if (!url) throw new Error(`not in the registry: ${name}`)
  if (seen.has(url)) return
  seen.add(url)
  const item = await (await fetch(url)).json()
  for (const dep of item.registryDependencies ?? []) await add(dep)
  for (const file of item.files ?? []) {
    const target = file.target || file.path
    const dest = target.startsWith('~/public/')
      ? join(root, 'public', target.slice('~/public/'.length))
      : join(root, 'src', target)
    await mkdir(dirname(dest), { recursive: true })
    await writeFile(dest, file.content)
  }
  console.log(`${item.name}  ${item.files?.length ?? 0} files`)
}

for (const name of process.argv.slice(2)) await add(name)
