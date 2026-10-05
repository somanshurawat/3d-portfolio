// Builds the whole site into ONE html file (dist-single/index.html) for quick previews
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
export default defineConfig({ plugins: [react(), viteSingleFile()], build: { outDir: 'dist-single' } })
