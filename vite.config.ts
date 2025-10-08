import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true, // Allow external connections (like Replit)
    port: 5173,
    strictPort: false,
    fs: {
      strict: false, // More permissive file access
      allow: ['..'], // Allow access to parent directories
    },
    cors: true, // Enable CORS for better API communication
    proxy: {
      // Proxy API requests to backend (like Replit does)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Pre-bundle these for faster loading
  },
  esbuild: {
    // Better development experience
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
