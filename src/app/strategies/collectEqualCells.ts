import { Point } from 'pixi.js-legacy';
import { CellSpriteType } from '../types';

function collectNearestEqualCells<T extends CellSpriteType>(
  map: T[][],
  centralCell: T,
  pos: Point,
  acc: T[],
  coordAcc: Point[],
) {
  const { x: tileX, y: tileY } = pos;
  const nearestCells = [
    new Point(tileX, tileY),
    new Point(tileX, tileY - 1),
    new Point(tileX, tileY + 1),
    new Point(tileX - 1, tileY),
    new Point(tileX + 1, tileY),
  ];
  const nearestCellsAmount = nearestCells.length;
  const mapWidth = map[0].length;
  const mapHeight = map.length;
  for (let i = 0; i < nearestCellsAmount; i += 1) {
    const { x, y } = nearestCells[i];
    if (x < 0 || y < 0 || x >= mapWidth || y >= mapHeight) {
      continue;
    }
    const cellNode = map[y][x];
    if (acc.includes(cellNode)) {
      continue;
    }
    if (centralCell.getGroupName() === cellNode.getGroupName()) {
      acc.push(cellNode);
      coordAcc.push(nearestCells[i]);
      collectNearestEqualCells(map, cellNode, nearestCells[i], acc, coordAcc);
    }
  }
}

export function collectEqualCells<T extends CellSpriteType>(map: T[][], pos: Point, min: number): [T[], Point[]] {
  const initialCell = map[pos.y][pos.x];
  const cellsAcc: T[] = [];
  const coordAcc: Point[] = [];
  if (initialCell.isNotEmpty()) {
    collectNearestEqualCells(map, initialCell, pos, cellsAcc, coordAcc);
  }
  if (cellsAcc.length >= min) {
    return [cellsAcc, coordAcc];
  }
  return [[], []];
}
