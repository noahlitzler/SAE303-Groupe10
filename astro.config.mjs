// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: isDev ? undefined : netlify()
});