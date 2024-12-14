import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import macrosPlugin from "vite-plugin-babel-macros"
// import nodePolyfills from 'vite-plugin-node-polyfills';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
  macrosPlugin(),
  nodePolyfills({
    buffer: true
  })
  ],
  resolve: {
    alias: {
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
    }
  },
  optimizeDeps: {
    exclude: ['@ethersproject/hash', 'wrtc'],
    include: ['js-sha3', '@ethersproject/bignumber']
  }
})
