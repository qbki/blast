import {
  Container,
  Text,
} from 'pixi.js-legacy';

import Button from './Button';
import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
  TEXT_STYLE,
} from './consts';

export default class TitleScreen extends Container {
  constructor() {
    super();

    const title = new Text(
      'Blast',
      {
        ...TEXT_STYLE,
        fontSize: 64,
        fontStyle: 'italic',
        fill: ['#ffffff', '#000000'],
      },
    );
    title.anchor.set(0.5, 1);
    title.position.set(
      SCENE_WIDTH * 0.5,
      SCENE_HEIGHT * 0.5,
    );
    this.addChild(title);

    const button = new Button({
      x: SCENE_WIDTH * 0.5,
      y: SCENE_HEIGHT * 0.6,
      caption: 'Start Game',
    });
    button.on('pointerup', () => this.emit('start'));
    this.addChild(button);
  }
}
