import { Sprite } from 'pixi.js-legacy';

export enum CellType {
  empty,
  bomb,
  blue,
  green,
  purple,
  red,
  yellow,
}

export interface CellSpriteType extends Sprite {
  getType: () => CellType;
}

export interface CellsDistribution {
  cellType: CellType;
  amount: number;
}
