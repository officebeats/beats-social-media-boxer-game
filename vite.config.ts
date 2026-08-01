import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    base: './',
    resolve: {
        alias: {
            '@engine': path.resolve(__dirname, 'src/engine'),
            '@scenes': path.resolve(__dirname, 'src/scenes'),
            '@objects': path.resolve(__dirname, 'src/objects'),
            '@utils': path.resolve(__dirname, 'src/utils'),
        },
    },
    build: {
        target: 'es2022',
        outDir: 'dist',
        assetsInlineLimit: 0, // Don't inline sprite sheets
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser'],
                },
            },
        },
    },
    server: {
        port: 5173,
        open: true,
    },
    define: {
        // Phaser 3 requires these globals
        'typeof CANVAS_RENDERER': JSON.stringify(true),
        'typeof WEBGL_RENDERER': JSON.stringify(true),
        'typeof WEBGL_DEBUG': JSON.stringify(false),
        'typeof EXPERIMENTAL': JSON.stringify(false),
        'typeof PLUGIN_CAMERA3D': JSON.stringify(false),
        'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
        'typeof FEATURE_SOUND': JSON.stringify(true),
    },
});
