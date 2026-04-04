import { resolve } from 'path'
import { defineConfig } from 'vite'
import type { LibraryFormats } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const isWidget = process.env.VITE_BUILD_TARGET === 'widget'
  const widgetFormats: LibraryFormats[] = ['iife']

  return {
    plugins: [react()],
    server: {
      port: 8611,
      strictPort: true,
    },
    build: isWidget
      ? {
          lib: {
            entry: resolve(__dirname, 'src/widget-entry.tsx'),
            name: 'LGQWidget',
            formats: widgetFormats,
            fileName: () => 'index',
          },
          cssCodeSplit: false,
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
              entryFileNames: 'index.js',
            },
          },
        }
      : {
          rollupOptions: {
            input: resolve(__dirname, 'app.html'),
          },
        },
  }
})
