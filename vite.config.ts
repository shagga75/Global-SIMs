import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Safely polyfill process.env.API_KEY for Vercel deployment
    // We check both VITE_API_KEY (Vite standard) and API_KEY (Node standard)
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY)
  }
});