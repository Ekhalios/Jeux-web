import { defineConfig } from 'vite';
import { portalPlugin } from '@webetnes/core/vite-portal-plugin';

// base './' : le même build fonctionne à la racine d'un zip de portail et dans un sous-dossier GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [portalPlugin()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
  },
  server: { host: true },
});
