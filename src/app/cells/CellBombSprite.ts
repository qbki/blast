import { ColorMatrixFilter, Texture } from 'pixi.js';
import TWEEN from '@tweenjs/tween.js';

import { CellSprite } from './CellSprite';

export class CellBombSprite extends CellSprite {
  constructor(texture: Texture, groupName: string) {
    super(texture, groupName);
    const colorMatrix = new ColorMatrixFilter();
    colorMatrix.greyscale(0.1, true);
    this.filters = [colorMatrix];
    new TWEEN.Tween({ alpha: 0.7 })
      .to({ alpha: 1 }, 1000)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(({ alpha }) => this.alpha = alpha)
      .yoyo(true)
      .repeat(Infinity)
      .start();
  }
}
