import { bootstrap } from '@webetnes/core';
import { GameScene } from './scenes/GameScene';
import { TitleScene } from './scenes/TitleScene';
import { theme } from './theme';

void bootstrap({
  id: 'blocky-fit',
  theme,
  scenes: [TitleScene, GameScene],
  portalEnv: import.meta.env.VITE_PORTAL,
});
