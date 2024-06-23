import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import eslint from 'vite-plugin-eslint';
import path from 'path';

export default defineConfig({
  plugins: [glsl(), eslint()],
  resolve: {},
  // build: {
  //   lib: {
  //     entry: path.resolve(__dirname, './src/tool/index.ts'),
  //     name: 'game',
  //     fileName: 'gamebody',
  //   },
  // },
  server: {
    host: '0.0.0.0',
  },
});
