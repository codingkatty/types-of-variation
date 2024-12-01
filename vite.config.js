import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // Ensure the environment variable is available to the client
    define: {
      'import.meta.env.VITE_SUPABASE_KEY': JSON.stringify(env.VITE_SUPABASE_KEY)
    }
  }
})
