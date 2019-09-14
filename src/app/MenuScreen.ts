import { Container } from 'pixi.js-legacy';

import Button from './Button';
import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
} from './consts';

export default class MenuScreen extends Container {
  constructor() {
    super();
    const titleButton = new Button({
      x: SCENE_WIDTH * 0.5,
      y: SCENE_HEIGHT * 0.45,
      caption: 'Exit to menu',
    });
    titleButton.on('pointerup', () => this.emit('tomenu'));
    this.addChild(titleButton);

    const resumeButton = new Button({
      x: SCENE_WIDTH * 0.5,
      y: SCENE_HEIGHT * 0.55,
      caption: 'Continue game',
    });
    resumeButton.on('pointerup', () => this.emit('resume'));
    this.addChild(resumeButton);
  }
}
