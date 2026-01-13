import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Maps your Vercel/Vite environment variables to the standard process.env structure
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || process.env.API_KEY),
    'process.env.WAQI_API_KEY': JSON.stringify(process.env.VITE_WAQI_API_KEY),
  }
});