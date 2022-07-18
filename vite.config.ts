import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
    plugins: [
        react(),
        vanillaExtractPlugin(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, '.', 'src'),
        },
    },
});
