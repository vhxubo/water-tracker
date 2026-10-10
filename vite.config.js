import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// base 用相对路径，同一份 dist 可直接部署到
// GitHub Pages（子路径）或 Cloudflare Pages / Vercel（根路径）
export default defineConfig({
  base: './',
  plugins: [vue(), tailwindcss()],
})
