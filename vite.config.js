import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: "KestraTopology",
      fileName: (format) => `kestra-topology.${format}.js`,
    },
    rollupOptions: {
        external: ['vue'],
        output: {
            globals: {
                vue: 'Vue'
            },
            cssCode: true,
        }
    }
  },
  plugins: [vue()],
})
