import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        proxy: {
            // Only proxy actual API calls — these are fetch() calls from inside React,
            // not browser page navigations. We use /api prefix to avoid conflicts.
            '/api': {
                target: 'http://localhost:3000',
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/socket.io': {
                target: 'http://localhost:3000',
                ws: true,
            },
        },
    },
    build: {
        outDir: '../src/public/dist',
        emptyOutDir: true,
    },
})
