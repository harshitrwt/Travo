import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'move-popup-html-and-scripts',
      apply: 'build',
      enforce: 'post',
      async closeBundle() {
        const dist = resolve(__dirname, 'dist')
        
        // Copy popup.html to root
        const popupSource = resolve(__dirname, 'dist/src/popup/index.html')
        const popupDest = resolve(__dirname, 'dist/popup.html')
        if (fs.existsSync(popupSource)) {
          fs.copyFileSync(popupSource, popupDest)
          console.log('✓ Moved popup.html to dist/')
        }
        
        // Copy scripts without bundling
        const contentSource = resolve(__dirname, 'src/content/contentScript.js')
        const contentDest = resolve(__dirname, 'dist/contentScript.js')
        if (fs.existsSync(contentSource)) {
          fs.copyFileSync(contentSource, contentDest)
          console.log('✓ Copied contentScript.js to dist/')
        }
        
        const bgSource = resolve(__dirname, 'src/background/background.js')
        const bgDest = resolve(__dirname, 'dist/background.js')
        if (fs.existsSync(bgSource)) {
          fs.copyFileSync(bgSource, bgDest)
          console.log('✓ Copied background.js to dist/')
        }
        
        // Clean up src folder
        const srcDir = resolve(__dirname, 'dist/src')
        if (fs.existsSync(srcDir)) {
          fs.rmSync(srcDir, { recursive: true })
          console.log('✓ Cleaned up dist/src/')
        }
      }
    },

    viteStaticCopy({
      targets: [
        { src: 'public', dest: '.' },
      ],
    }),
  ],

  root: '.',
  publicDir: 'public',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },

      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
})
