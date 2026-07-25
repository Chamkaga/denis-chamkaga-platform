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
})
