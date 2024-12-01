import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'import.meta.env.VITE_SUPABASE_KEY': JSON.stringify(process.env.VITE_SUPABASE_KEY)
  }
})
