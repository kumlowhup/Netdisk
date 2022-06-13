import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// element-plus 自动引入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Netdisk/' : '/dev/',
  // base: "/Netdisk/",
  build: {
    outDir: 'static'
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ],
  server: {
    hmr: true,
    host: '0.0.0.0',
    port: 10001,
    proxy: {
      '/Netdisk': {
        cors: true,
        target: 'http://47.96.253.99:10002/Netdisk',
        rewrite: (path) => path.replace(/^\/Netdisk/, '')
      },
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})

