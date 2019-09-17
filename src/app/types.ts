import { Sprite } from 'pixi.js-legacy';

export enum CellType {
  empty,
  regular,
  bomb,
}

export enum Strategy {
  equals,
  explosion,
}

export interface CellSpriteType extends Sprite {
  getGroupName: () => string;
  isEmpty: () => boolean;
  isNotEmpty: () => boolean;
}

export interface CellConfigNode {
  amount: number;
  texture: string;
  strategy: Strategy;
  cellType: CellType;
}

export interface CellsConfig {
  [key: string]: CellConfigNode;
}
