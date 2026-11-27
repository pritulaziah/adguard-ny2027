import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [svelte()],
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    host: 'localhost',
  },
  preview: {
    host: 'localhost',
  },
  build: {
    rollupOptions: {
      output: {
        // Keep three.js in its own chunk, so an app change does not invalidate it.
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three';
        },
      },
    },
  },
});
