import { Sprite } from 'pixi.js-legacy';

export enum CellColor {
  none,
  blue,
  green,
  purple,
  red,
  yellow,
}

export enum CellType {
  empty,
  regular,
  bomb,
}

export interface CellSpriteType extends Sprite {
  isColor: (color: CellColor) => boolean;
  getColor: () => CellColor;
  getType: () => CellType;
}
