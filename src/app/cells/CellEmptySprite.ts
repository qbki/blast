import { Texture } from 'pixi.js-legacy';
import { CellSprite } from './CellSprite';

export class CellEmptySprite extends CellSprite {
  constructor(texture: Texture = Texture.EMPTY, groupName = '') {
    super(texture, groupName);
  }

  public isEmpty() {
    return true;
  }
}
