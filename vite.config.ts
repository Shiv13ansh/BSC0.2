
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This allows the browser to access these variables via process.env
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.API_KEY),
      'process.env.WAQI_API_KEY': JSON.stringify(env.VITE_WAQI_API_KEY || env.WAQI_API_KEY),
    },
  };
});