import contentCollections from '@content-collections/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { redact } from '@tanstack/redact/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
  ssr: {
    // Lets Redact redirect React imports inside server dependencies
    noExternal: true,
    // CommonJS/UMD deps the dev SSR runner can't evaluate inline
    optimizeDeps: { include: ['slugify', '@content-collections/mdx/react'] },
  },
  plugins: [
    devtools(),
    netlify({
      dev: { edgeFunctions: { enabled: false } },
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    // Swaps React/React DOM for TanStack Redact in the browser bundle.
    // Portals stay on for the TanStack devtools panel.
    redact({ features: { activity: false, fragmentRefs: false } }),
    contentCollections(),
  ],
})

export default config
