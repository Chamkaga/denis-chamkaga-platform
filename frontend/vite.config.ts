import { defineConfig, createLogger } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const customLogger = createLogger()
const originalInfo = customLogger.info

customLogger.info = (msg, options) => {
  const lowercaseMsg = msg.toLowerCase()
  if (
    lowercaseMsg.includes('re-optimizing') ||
    lowercaseMsg.includes('scanning') ||
    lowercaseMsg.includes('bundling') ||
    lowercaseMsg.includes('optimizer') ||
    lowercaseMsg.includes('dependencies')
  ) {
    return
  }
  originalInfo(msg, options)
}

// https://vite.dev/config/
export default defineConfig({
  customLogger,
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dc/shared': path.resolve(__dirname, '../shared/dist'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('/xlsx/') || id.includes('\\xlsx\\')) {
              return 'vendor-spreadsheet';
            }
            if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
              return 'vendor-pdf';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'vendor-query';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
