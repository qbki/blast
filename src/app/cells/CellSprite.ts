import {
  Point,
  Sprite,
  Texture,
} from 'pixi.js-legacy';

import {
  TILE_HEIGHT,
  TILE_OFFSET_X,
  TILE_OFFSET_Y,
  TILE_WIDTH,
} from '../consts';
import { CellType } from '../types';

export class CellSprite extends Sprite {
  public static coordToCellPos(coord: Point) {
    return new Point(
      Math.floor((coord.x - TILE_OFFSET_X) / TILE_WIDTH),
      Math.floor((coord.y - TILE_OFFSET_Y) / TILE_HEIGHT),
    );
  }

  private _cellType: CellType;

  constructor(texture: Texture, cellType: CellType = CellType.blue) {
    super(texture);
    this.scale.set(0.233, 0.233);
    this._cellType = cellType;
  }

  public placeOnMap(x: number, y: number) {
    this.position.set(
      x * TILE_WIDTH + TILE_OFFSET_X,
      y * TILE_HEIGHT + TILE_OFFSET_Y,
    );
  }

  public getType() {
    return this._cellType;
  }

  public setTexture(texture: Texture) {
    this.texture = texture;
  }

  public tilePos() {
    return CellSprite.coordToCellPos(this.position);
  }
}
