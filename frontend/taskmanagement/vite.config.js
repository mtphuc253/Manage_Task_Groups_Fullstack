/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // 👈 cần thêm để dùng alias

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'), // 👈 alias ~ trỏ đến thư mục src
    },
  },
})
