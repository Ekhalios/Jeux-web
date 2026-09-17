import { bootstrap } from '@webetnes/core';
import { GameOverScene } from './scenes/GameOverScene';
import { GameScene } from './scenes/GameScene';
import { TitleScene } from './scenes/TitleScene';
import { theme } from './theme';

void bootstrap({
  id: 'tap-tower',
  theme,
  scenes: [TitleScene, GameScene, GameOverScene],
  portalEnv: import.meta.env.VITE_PORTAL,
});
