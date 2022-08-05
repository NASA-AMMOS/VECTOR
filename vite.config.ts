import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
    plugins: [
        react(),
        checker({ typescript: true }),
        vanillaExtractPlugin(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, '.', 'src'),
        },
    },
});
