
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to resolve 'cwd' property error if Node types are missing in the TS configuration
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.API_KEY || ""),
      'process.env.WAQI_API_KEY': JSON.stringify(env.VITE_WAQI_API_KEY || ""),
    }
  };
});
