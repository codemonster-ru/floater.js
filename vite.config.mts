import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
    build: {
        emptyOutDir: true,
        minify: true,
        lib: {
            name: 'index',
            entry: resolve(__dirname, './src/index.ts'),
            fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            treeshake: true,
        },
    },
});
