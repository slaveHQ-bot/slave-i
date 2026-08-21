import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: resolve(__dirname, 'src/main/index.ts'),

        vite: {
          build: {
            outDir: '../../dist/main',
            rollupOptions: {
              external: [
                '@libsql/client'
              ],
            },
          },
        },
        onstart(options) {
          options.startup();
        },
      },
      {
        entry: resolve(__dirname, 'src/preload/index.ts'),
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: '../../dist/preload',
          },
        },
      },
    ]),
    renderer(),
  ],
  root: 'src/renderer',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
});
