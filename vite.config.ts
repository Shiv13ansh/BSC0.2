import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // We remove the 'define' section entirely. 
  // We rely on the platform to inject process.env.API_KEY securely at runtime.
});