import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import eslint from 'vite-plugin-eslint';
import path from 'path';

export default defineConfig({
  plugins: [glsl(), eslint()],
  resolve: {},
  build: {
    outDir: 'docs',
  },
  base: '/501/',
  server: {
    host: '0.0.0.0',
  },
});
