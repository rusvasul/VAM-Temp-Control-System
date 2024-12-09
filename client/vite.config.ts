import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true, // Automatically open browser
    host: true, // Listen on all network interfaces
  },
  preview: {
    port: 5173,
    open: true,
  },
})