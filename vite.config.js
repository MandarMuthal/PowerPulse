import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the React app talks to the Express proxy on :8787 via /api.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8787' },
  },
});
