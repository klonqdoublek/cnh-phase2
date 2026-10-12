import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const src = new URL('./src', import.meta.url).pathname

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /* One port, always. strictPort fails loudly when 5175 is taken instead of
     drifting to the next port and leaving a second server behind. */
  server: { port: 5175, strictPort: true },
  resolve: {
    alias: [
      /* The registry's own files import each other as `@/bbl/*` and
         `@/patterns/*`. Keeping those specifiers intact is what lets an
         installed file stay byte-identical to what webds ships, so `audit.mjs`
         can tell an edit from an install. Order matters: the two specific
         prefixes have to resolve before the catch-all `@`. */
      { find: /^@\/bbl\//, replacement: `${src}/components/bbl/` },
      { find: /^@\/patterns\//, replacement: `${src}/components/patterns/` },
      { find: /^@\//, replacement: `${src}/` },
    ],
  },
})
