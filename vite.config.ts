import { resolve } from 'path';
import { defineConfig } from 'vite';

function root(...args: string[]) {
  return resolve(__dirname, ...args);
}

export default defineConfig({
  publicDir: root('assets'),
  build: {
    outDir: root('dist')
  },
});
