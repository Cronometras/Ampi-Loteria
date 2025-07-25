import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 9002,
  },
  build: {
    outDir: 'dist',
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['genkit', '@genkit-ai/core', '@genkit-ai/ai', '@genkit-ai/googleai', '@genkit-ai/next']
  }
})