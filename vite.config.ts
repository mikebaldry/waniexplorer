import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import arraybuffer from "vite-plugin-arraybuffer";

// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    nodePolyfills(
      {
        include: ["buffer", "util", "stream"],
        globals: { Buffer: true }
      }
    ),
    arraybuffer()
  ],
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, './node_modules/bootstrap'),
    }
  },

})
