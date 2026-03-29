import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

function createManualChunks(id: string) {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  if (
    id.includes('/react/') ||
    id.includes('/react-dom/') ||
    id.includes('react-router-dom') ||
    id.includes('@remix-run/router')
  ) {
    return 'react-vendor';
  }

  if (id.includes('framer-motion')) {
    return 'motion-vendor';
  }

  if (id.includes('@supabase') || id.includes('@lovable.dev')) {
    return 'auth-vendor';
  }

  if (id.includes('@tanstack/react-query')) {
    return 'query-vendor';
  }

  if (id.includes('recharts') || id.includes('d3-') || id.includes('date-fns')) {
    return 'charts-vendor';
  }

  if (
    id.includes('@radix-ui') ||
    id.includes('class-variance-authority') ||
    id.includes('clsx') ||
    id.includes('cmdk') ||
    id.includes('sonner') ||
    id.includes('tailwind-merge') ||
    id.includes('vaul')
  ) {
    return 'ui-vendor';
  }

  return undefined;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isGithubPages = process.env.GITHUB_ACTIONS === 'true';
  const base = process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || (isGithubPages ? '/mystic-cards/' : '/');

  return {
    base,
    server: {
      host: '::',
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: createManualChunks,
        },
      },
    },
  };
});
