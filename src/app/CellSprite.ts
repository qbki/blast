import {
  Point,
  Texture,
  TilingSprite,
} from 'pixi.js-legacy';

import {
  TEXTURE_TILE_HEIGHT,
  TEXTURE_TILE_WIDTH,
  TILE_HEIGHT,
  TILE_OFFSET_X,
  TILE_OFFSET_Y,
  TILE_WIDTH,
} from './consts';

export const enum CellStatus {
  interactive,
}

export const enum CellColor {
  blue,
  green,
  purple,
  red,
  yellow,
}

export default class CellSprite extends TilingSprite {
  public static coordToCellPos(coord: Point) {
    return new Point(
      Math.floor((coord.x - TILE_OFFSET_X) / TILE_WIDTH),
      Math.floor((coord.y - TILE_OFFSET_Y) / TILE_HEIGHT),
    );
  }

  private _status: CellStatus;
  private _color: CellColor;

  constructor(texture: Texture) {
    super(texture, TEXTURE_TILE_WIDTH, TEXTURE_TILE_HEIGHT);
    this.scale.set(0.233, 0.233);
    this._status = CellStatus.interactive;
    this._color = CellColor.blue;
  }

  public placeOnMap(x: number, y: number) {
    this.position.set(
      x * TILE_WIDTH + TILE_OFFSET_X,
      y * TILE_HEIGHT + TILE_OFFSET_Y,
    );
  }

  public tilePos() {
    return CellSprite.coordToCellPos(this.position);
  }

  public hasStatus(cellStatus: CellStatus) {
    return this._status === cellStatus;
  }

  public hasNotStatus(cellStatus: CellStatus) {
    return !this.hasStatus(cellStatus);
  }

  public hasColor(color: CellColor) {
    return this._color === color;
  }

  public hasNotColor(color: CellColor) {
    return !this.hasColor(color);
  }

  // private textureTilePos(x: number, y: number) {
    // return new Point(x * TEXTURE_TILE_WIDTH, y * TEXTURE_TILE_HEIGHT);
  // }
}
