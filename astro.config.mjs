import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://raluma.com.ru',
  server: {
    host: true,
    port: 4321,
  },
});
