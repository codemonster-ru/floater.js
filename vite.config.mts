import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
    plugins: [dts()],
    build: {
        emptyOutDir: true,
        lib: {
            name: 'index',
            entry: resolve(__dirname, './src/index.ts'),
            fileName: 'index.ts',
            formats: ['es', 'umd'],
        },
    },
});