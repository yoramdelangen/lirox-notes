import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
    formats: ['iife'],
    name: 'LiroxNotesEditorBundle',
      fileName: () => 'editor.js',
    },
    outDir: resolve(__dirname, '../../crates/app/assets'),
  },
});
