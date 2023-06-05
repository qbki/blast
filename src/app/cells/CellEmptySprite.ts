import { Texture } from 'pixi.js';
import { CellSprite } from './CellSprite';

export class CellEmptySprite extends CellSprite {
  constructor(texture: Texture = Texture.EMPTY, groupName = '') {
    super(texture, groupName);
  }

  public override isEmpty() {
    return true;
  }
}
