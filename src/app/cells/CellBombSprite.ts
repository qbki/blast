import {
  filters,
  Texture,
} from 'pixi.js-legacy';
import { CellSprite } from './CellSprite';
import TWEEN from '@tweenjs/tween.js';

export class CellBombSprite extends CellSprite {
  constructor(texture: Texture, groupName: string) {
    super(texture, groupName);
    const colorMatrix = new filters.ColorMatrixFilter();
    colorMatrix.greyscale(0.2, true);
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
