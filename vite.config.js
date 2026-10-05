import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiRoute, loadEnvFile } from './server/chat.js'

// In development, serve the chat API from the same port as the site
const devApi = () => ({
  name: 'dev-chat-api',
  configureServer(server) {
    loadEnvFile()
    server.middlewares.use((req, res, next) => (apiRoute(req, res) ? undefined : next()))
  },
})

export default defineConfig({ plugins: [react(), devApi()] })
