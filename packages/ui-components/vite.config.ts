/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import * as path from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import macrosPlugin from 'vite-plugin-babel-macros'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true
    }),
    macrosPlugin()
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'index',
      formats: ['es', 'umd'],
      fileName: format => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'node-stdlib-browser/helpers/esbuild/shim.js'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
          // '@emotion/styled': 'styled',
          // '@emotion/react': 'ThemeProvider'
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['setupTests.ts'],
    include: ['src/{components,state,hooks}/**/(*.)?{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'setupTests.ts']
    }
  }
})
