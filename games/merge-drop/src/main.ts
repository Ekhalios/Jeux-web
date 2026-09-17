import { bootstrap } from '@webetnes/core';
import { GameScene } from './scenes/GameScene';
import { TitleScene } from './scenes/TitleScene';
import { theme } from './theme';

void bootstrap({
  id: 'merge-drop',
  theme,
  scenes: [TitleScene, GameScene],
  portalEnv: import.meta.env.VITE_PORTAL,
  physics: { default: 'matter', matter: { gravity: { x: 0, y: 1.1 }, debug: false } },
});
