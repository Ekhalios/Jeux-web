/**
 * Plugin Vite pour les builds par portail.
 * Le portail est déduit du mode Vite : `vite build --mode poki` ou `--mode crazygames` ;
 * tout autre mode vaut 'none' (GitHub Pages, développement).
 * - définit import.meta.env.VITE_PORTAL pour le code du jeu ;
 * - remplace le marqueur <!--PORTAL_SDK--> de index.html par la balise script du SDK du portail.
 * Les portails interdisent tout autre script tiers : c'est le seul point d'injection.
 */
const SCRIPTS = {
  poki: '<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>',
  crazygames: '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>',
};

export function portalPlugin() {
  let portal = 'none';
  return {
    name: 'webetnes-portal-sdk',
    config(_config, env) {
      portal = env.mode in SCRIPTS ? env.mode : 'none';
      return { define: { 'import.meta.env.VITE_PORTAL': JSON.stringify(portal) } };
    },
    transformIndexHtml(html) {
      return html.replace('<!--PORTAL_SDK-->', SCRIPTS[portal] ?? '');
    },
  };
}
