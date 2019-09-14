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
} from './consts';

export const enum CellColor {
  blue,
  green,
  purple,
  red,
  yellow,
  none,
}

export default class CellSprite extends Sprite {
  public static coordToCellPos(coord: Point) {
    return new Point(
      Math.floor((coord.x - TILE_OFFSET_X) / TILE_WIDTH),
      Math.floor((coord.y - TILE_OFFSET_Y) / TILE_HEIGHT),
    );
  }

  private _color: CellColor;

  constructor(texture: Texture) {
    super(texture);
    this.scale.set(0.233, 0.233);
    this._color = CellColor.blue;
  }

  public placeOnMap(x: number, y: number) {
    this.position.set(
      x * TILE_WIDTH + TILE_OFFSET_X,
      y * TILE_HEIGHT + TILE_OFFSET_Y,
    );
  }

  public setColor(color: CellColor) {
    this._color = color;
  }

  public getColor() {
    return this._color;
  }

  public tilePos() {
    return CellSprite.coordToCellPos(this.position);
  }

  public isColor(color: CellColor) {
    return this._color === color;
  }

  public isNotColor(color: CellColor) {
    return !this.isColor(color);
  }
}
